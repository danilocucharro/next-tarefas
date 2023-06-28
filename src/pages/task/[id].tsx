import { GetServerSideProps } from 'next';
import { FormEvent, ChangeEvent, useState } from 'react'
import { useSession } from 'next-auth/react'
import Head from 'next/head';
import styles from './styles.module.css'

import { db } from '../../services/firebaseConnection'
import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where 
} from 'firebase/firestore'
import { Textarea } from '@/src/components/textarea';

interface TaskProps{
  item: {
    tarefa: string;
    createdAt: string;
    public: boolean;
    user: string;
    taskId: string
  }
}

export default function Task({ item }: TaskProps){
  const { data: session } = useSession()

  const [input, setInput] = useState("")

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

      <section className={styles.comentsContainer}>
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
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  
  const docRef = doc(db, "tarefas", id)

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
    }
  }
}