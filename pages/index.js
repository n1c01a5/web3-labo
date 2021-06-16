import { useState, useCallback, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'

import Web3 from 'web3'

import styles from '../styles/Home.module.css'

export default function Home() {
  const [isConnectedWeb3, setIsConnectedWeb3] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [balance, setBalance] = useState(0)
  const [web3, setWeb3] = useState({})
  const [weiToSend, setWeiToSend] = useState(0)
  const [addressToSend, setAddressToSend] = useState("")

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

    const getAccounts = async () => setAccounts(await web3.eth.getAccounts())
    const getBalance = async () => setBalance(await web3.eth.getBalance(accounts[0]))

    if (accounts.length == 0) getAccounts()
    if (accounts.length > 0) getBalance()
  }, [isConnectedWeb3, accounts])

  const sendEth = useCallback(
    async () => {
      await web3.eth.sendTransaction({ from: accounts[0], to: addressToSend, value: weiToSend })
    },
    [accounts, addressToSend, weiToSend]
  )

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
        <h2>Balance</h2>
        <p>{accounts[0]}</p>
        <p>{balance}wei</p>
        <h2>Send ETH</h2>
        <input type="number" onChange={e => setWeiToSend(e.target.value)} placeholder="Eth in wei" />
        <input type="text" onChange={e => setAddressToSend(e.target.value)} placeholder="address" />
        <button onClick={sendEth}>Send Eth</button>
      </main>
    </div>
  )
}
