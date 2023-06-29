import { GetServerSideProps } from 'next';
import { FormEvent, ChangeEvent, useState } from 'react'
import { useSession } from 'next-auth/react'
import Head from 'next/head';
import styles from './styles.module.css'

import { db } from '../../services/firebaseConnection'
import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  collection,
  query,
  where 
} from 'firebase/firestore'
import { Textarea } from '@/src/components/textarea';
import { FaTrash } from 'react-icons/fa'

interface TaskProps{
  item: {
    tarefa: string;
    createdAt: string;
    public: boolean;
    user: string;
    taskId: string;
  };
  allComments: CommentProps[];
}

interface CommentProps{
  id: string;
  comment: string;
  taskId: string;
  user: string;
  name: string;
}

export default function Task({ item, allComments }: TaskProps){
  const { data: session } = useSession()

  const [input, setInput] = useState("")
  const [comments, setComments] = useState(allComments || [])

  async function handleComment(event: FormEvent){
    event.preventDefault()

    if(input === "") return;

    if(!session?.user?.email || !session?.user?.name) return;

    try{
      const docRef = await addDoc(collection(db, "comments"), {
        comment: input,
        createdAt: new Date(),
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item?.taskId
      })

      const data = {
        id: docRef.id,
        comment: input,
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item?.taskId
      }

      setComments((oldItems)=>[...oldItems, data])
      setInput("")

    }catch(err){
      console.log(err)
    }
  }

  return(
    <div className={styles.container}>
      <Head>
        <title>Tarefa - Detalhes da tarefa</title>
      </Head>

      <main className={styles.main}>
        <h1>Tarefa</h1>
        <article className={styles.task}>
          <p>
            {item.tarefa}
          </p>
        </article>
      </main>

      <section className={styles.commentsContainer}>
        <h2>Deixar comentário</h2>

        <form onSubmit={handleComment}>
          <Textarea
            value={input}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>)=> setInput(event.target.value)}
            placeholder="Digite seu comentário..."
          />
          <button
          disabled={!session?.user} 
          className={styles.button}
          >Enviar Comentário
          </button>
        </form>
      </section>

      <section className={styles.commentsContainer}>
        <h2>Todos os Comentários</h2>
        {comments.length === 0 &&(
          <span>Nenhum comentário foi encontrado...</span>
        )}

        {comments.map((item)=> (
          <article key={item.id} className={styles.comment}>
            <div className={styles.headComment}>
              <label className={styles.commentsLabel}>{item.name}</label>
              {item.user === session?.user?.email && (
                <button className={styles.buttonTrash}>
                  <FaTrash size={18} color="#ea3140"/>
                </button>
              )}
            </div>
            <p>{item.comment}</p>
          </article>
        ))}
      </section>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  
  const docRef = doc(db, "tarefas", id)

  const q = query(collection(db, "comments"), where("taskId", "==", id))
  const snapshotComments = await getDocs(q)

  let allComments: CommentProps[] = [];
  snapshotComments.forEach((doc)=> {
    allComments.push({
      id: doc.id,
      comment: doc.data().comment,
      user: doc.data().user,
      name: doc.data().name,
      taskId: doc.data().taskId
    })
  })

  const snapshot = await getDoc(docRef)

  if(snapshot.data() === undefined){
    return{
      redirect:{
        destination: '/',
        permanent: false
      }
    }
  }

  if(!snapshot.data()?.public){
    return{
      redirect:{
        destination: '/',
        permanent: false
      }
    }
  }

  const miliseconds = snapshot.data()?.createdAt?.seconds * 1000;

  const task = {
    tarefa: snapshot.data()?.tarefa,
    public: snapshot.data()?.public,
    createdAt: new Date(miliseconds).toLocaleDateString(),
    user: snapshot.data()?.user,
    taskId: id
  }

  return{
    props:{
      item: task,
      allComments: allComments,
    }
  }
}