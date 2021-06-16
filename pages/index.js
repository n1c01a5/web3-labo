import { useState, useCallback, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'

import Web3 from 'web3'

import styles from '../styles/Home.module.css'

export default function Home() {
  const [isConnectedWeb3, setIsConnectedWeb3] = useState(false)
  const [web3, setWeb3] = useState({})

  const connectToWeb3 = useCallback(
    async () => {
      if(window.ethereum) {
        try {
          await window.ethereum.request({method: 'eth_requestAccounts'})

          setIsConnectedWeb3(true)
        } catch (err) {
          console.error(err)
        }
      } else {
        alert("Install Metamask")
      }
    }
  )

  useEffect(() => {
    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545")

    setWeb3(web3)

    console.log(web3) // web3 instance
  }, [isConnectedWeb3])

  return (
    <div className={styles.container}>
      <Head>
        <title>Web3 Labo</title>
        <meta name="description" content="Web3 Labo" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Web3 Labo
        </h1>
        <h2>Connect Web3</h2>
        {
          isConnectedWeb3
            ? <p>Connected</p>
            : <button onClick={connectToWeb3}>Connect to web3</button>
        }
      </main>
    </div>
  )
}
