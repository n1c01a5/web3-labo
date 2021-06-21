import { useState, useCallback, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'

import Web3 from 'web3'

import StorageABI from '../contract/storage.json'

import styles from '../styles/Home.module.css'

export default function Home() {
  const [isConnectedWeb3, setIsConnectedWeb3] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [balance, setBalance] = useState(0)
  const [web3] = useState(new Web3(Web3.givenProvider || "ws://localhost:8545"))
  const [weiToSend, setWeiToSend] = useState(0)
  const [addressToSend, setAddressToSend] = useState("")
  const [number, setNumber] = useState(0)
  const [numberInput, setNumberInput] = useState(0)
  const [events, setEvents] = useState([])
  const [txHash, setTxHash] = useState("")
  const [isMined, setIsMined] = useState(false)

  const STORAGE_ADDR = "0xEEbCbE87BaB901B40e83ebB9F3483f3a3A7fd15b"

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
    // Accounts
    const getAccounts = async () => setAccounts(await web3.eth.getAccounts())
    const getBalance = async () => setBalance(await web3.eth.getBalance(accounts[0]))

    if (accounts.length == 0) getAccounts()
    if (accounts.length > 0) getBalance()

    // Events
    const storageContract = new web3.eth.Contract(
      StorageABI,
      STORAGE_ADDR
    )

    const getEvents = async () => setEvents(
      await storageContract.getPastEvents(
        'SetNumber',
        {
          filter: {},
          fromBlock: 25497336,
          toBlock: 'latest'
        }
      )
    )

    getEvents()

    // With then
    // const events = await storageContract.getPastEvents(
    //   'SetNumber',
    //   {
    //     filter: {},
    //     fromBlock: 25497336,
    //     toBlock: 'latest'
    //   }
    // ).then(events => setEvents(events.reverse()))

    // With callback
    // const events = await storageContract.getPastEvents(
    //   'SetNumber',
    //   {
    //     filter: {},
    //     fromBlock: 25497336,
    //     toBlock: 'latest'
    //   },
    //   (err, res) => {
    //     setEvents(res.reverse())
    //   }
    // )
  }, [isConnectedWeb3, accounts])

  const sendEth = useCallback(
    async () => {
      await web3.eth.sendTransaction({ from: accounts[0], to: addressToSend, value: weiToSend })
    },
    [accounts, addressToSend, weiToSend]
  )

  useEffect(() => {
    const getNumber = async () => {
      const storageContract = new web3.eth.Contract(
        StorageABI,
        STORAGE_ADDR
      )

      const number = await storageContract.methods.retrieve().call({ from: accounts[0]})

      setNumber(number)
    }

    getNumber()
  }, [])

  const sendNewNumber = useCallback(
    async () => {
      const storageContract = new web3.eth.Contract(
        StorageABI,
        STORAGE_ADDR
      )
  
      await storageContract.methods.store(numberInput).send({from: accounts[0]})
        // .once('sending', payload => console.log(payload))
        .once('transactionHash', (transactionHash) => setTxHash(transactionHash))
        .on('confirmation', (confNumber, receipt) => {
          setIsMined(true)
          setNumber(receipt.events.SetNumber.returnValues[0])

          console.log(receipt)
        })
    },
    [accounts, numberInput]
  )

  const eventsItems = events.map((event, index) =>
    <li key={index.toString()}>
      {event.returnValues[0]}
    </li>
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
        <h2>Smart Contract Storage</h2>
        <h2>Number</h2>
        <p>{number}</p>
        <h2>Set Number</h2>
        <input type="number" onChange={e => setNumberInput(e.target.value)} placeholder="Number" />
        <button onClick={sendNewNumber}>Send New Number</button>
        {
          (txHash && !isMined) 
            && 
            <div>
              <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
              <a href={`https://kovan.etherscan.io/tx/${txHash}`} target="_blank">
                Loader ...
              </a>
            </div>
        }
        {
          isMined && <p>Transaction Mined</p>
        }
        <h2>Events</h2>
        <ul>{eventsItems}</ul>
      </main>
    </div>
  )
}
