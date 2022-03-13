import React, { useCallback, useEffect, useState } from 'react'
import { Row, Col, Input, Button } from 'antd'
import { GithubOutlined } from '@ant-design/icons'
import style from './index.module.less'
import { ethers } from 'ethers'

import MyNftAbi from '../../data/abi/MyNft.json'
import MyNftAddr from '../../deployments/localhost/MyNft.json'

// import VaultAbi from '../../data/abi/Vault.json'
// import VaultAddr from '../../deployments/localhost/Vault.json'

export default function App() {
  // console.log('MyTokenAddr', MyNft)
  const [account, setAccount] = useState()

  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner>()
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>()

  const [token, setToken] = useState<ethers.Contract>()


  // connect wallet
  async function connectWallet() {
    await initAccount()
  }

  // 初始化 provider,singner
  async function initProviderOrSigner() {
    const tempProvider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(tempProvider)
    setSigner(tempProvider.getSigner())
  }

  useEffect(() => {
    console.log('--account', account)
    if (!!account) {
      initProviderOrSigner()
    }
  }, [account])

  useEffect(() => {
    if (!!provider && !!signer) {
      initDeployedContract()
    }
  }, [provider, signer])

  // 初始化账号
  async function initAccount() {
    try {
      if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!')
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const curAccount = accounts?.[0]
        setAccount(curAccount)
      }
    } catch (e) {
      console.log('初始化失败', e)
    }
  }

  // 链接已部署合约
  async function initDeployedContract() {
    // setVault(new ethers)
    let network = await provider?.getNetwork()
    let chainId = network?.chainId
    setToken(new ethers.Contract(MyNftAddr.address, MyNftAbi, signer))
  }

  const [tokenName, setTokenName] = useState('')
  const [balanceOf, setBalanceOf] = useState<string>()

  // 获取token相关信息
  async function getTokenInfo() {
    const tn = await token?.name()
    setTokenName(tn)
    const fBalanceOf = await token?.balanceOf(account)
    setBalanceOf(ethers.utils.formatUnits(fBalanceOf, 0))
  }

  // console.log()
  // 增发操作
  async function mintNft() {
    token?.mintNft(account)
    getTokenInfo()
  }



  const [tokenId,setTokenId] = useState<number>()
  const [toAddress,setToAddress] = useState<string>('')

  // 转账
  async function transfer() {
    token?.safeTransferFrom(account,toAddress,tokenId)
    getTokenInfo()
  }




  //  decode event事件
async function parseTransferEvent(event:any) {    
  const TransferEvent = new ethers.utils.Interface(["event Transfer(address indexed from,address indexed to,uint256 value)"]);  
  // const TransferEvent = new ethers.utils.Interface(["event Transfer(address indexed,address indexed,uint256 indexed)"]);

  let decodedData = TransferEvent.parseLog(event);
  console.log("from:",decodedData.args?.from)
  console.log("to:",decodedData.args?.to)
  console.log("value:",decodedData.args?.value?.toString())
    // 调用后台接口 API ，保存至数据库
}




  // let  filter = {
  //       address: MyNftAddr.address,
  //       topics: [
  //           ethers.utils.id("Transfer(address,address,uint256)")
  //       ]
  //   }


  // 获取事件记录
  async function getLogs() {

    let filter = token?.filters.Transfer(null,account)
    // 获取 开始区块到结束区块之间的 相应event记录
    // 若不写 fromBlock，和 toBlock。 则默认获取当前最新区块的event记录
    const modFilter = {
      ...filter,
      fromBlock:6530111,
      toBlock:6530897
    }
    let events = await provider?.getLogs(modFilter) || [];
    console.log('events',events)
    for (let i = 0; i < events?.length; i++) {
        // console.log(events[i]);
        parseTransferEvent(events[i]);

    }
}


  // 根据token是否变化, 相应token事件监听只挂载一次
useEffect(() => {
  // 事件监听
  token?.on("Transfer", (from, to, tokenId, event) => {
    console.log('监听Transfer事件start')
    // 在值变化的时候被调用
    console.log(from);

    console.log(to);

    console.log(tokenId);

    // 查看后面的事件触发器  Event Emitter 了解事件对象的属性
    console.log(event.blockNumber);
    // 4115004
});



// 事件过滤
// 使用签名器地址作为事件触发者进行过滤
let filter = token?.filters.Transfer(null,account);
if(filter){
  token?.on(filter, ( from, to, tokenId, event) => {
      // const decodedEvent = token.interface.decodeEventLog(
      //       "Transfer", //
      //       event.data,
      //       event.topics
      //   );
      //   console.log('decodedEvent',decodedEvent);
    // 只有我们账号（签名器地址）铸造的nft的才回调
  console.log('---filter',from, to, tokenId, event)
  // 调用后台接口 API ，保存至数据库
  parseTransferEvent(event)
});
}
},[token])





  useEffect(() => {
    if (token) {
      getTokenInfo()
    }
  }, [token])

  return (
    <div className={style.global}>
      <Row justify='center' gutter={20}>
        <Col>
          ohohoh,发现世界！！
          <GithubOutlined />
        </Col>
      </Row>

      <Row justify='center' gutter={20}>
        <Col>
          {!account && (
            <Button onClick={connectWallet} type='primary'>
              链接wallet
            </Button>
          )}
        </Col>

        <Col>
          {!!account && (
            <div style={{ background: '#79b473' }}>
              <span>当前账户</span>
              <span>{account || '-----'}</span>
            </div>
          )}
        </Col>
      </Row>
      <Row justify='center' gutter={20}>
        <Col>
          <span>
            tokenName:
            <span>{tokenName || '暂无'}</span>
          </span>
        </Col>
      </Row>

      <Row justify='center' gutter={20}>
        <Col>
          <span>当前账户铸造数量：{balanceOf}</span>
        </Col>
        <Col>
          <div style={{ marginLeft: '20px' }}>
            <Button type='primary' onClick={() => mintNft()}>
              铸造
            </Button>
          </div>
        </Col>
      </Row>


      <Row justify='center' gutter={20}>
        <Col>
          <span>转移：</span>
        </Col>
        <Col>
        tokenId 为
        </Col>
        <Col>
          <Input type='number' value={tokenId} onChange={(e) => setTokenId(Number(e.target.value || 0))}></Input>
        </Col>


        <Col>
         到
        </Col>
        <Col>
          <Input value={toAddress} onChange={(e) => setToAddress(e.target.value)}></Input>
        </Col>
        <Col>
          <div style={{ marginLeft: '20px' }}>
            <Button type='primary' onClick={() => transfer()}>
            转移
            </Button>
          </div>
        </Col>
      </Row>
      <Row justify='center' >
        <Col>
        <Button onClick={() => getLogs()}>获取logs
          </Button></Col>
      </Row>
    </div>
  )
}
