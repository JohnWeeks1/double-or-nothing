import React, { Component } from "react";
import Coin from "./contracts/Coin.json";
import getWeb3 from "./getWeb3";
import Nav from "./components/Nav";

import "./App.css";

class App extends Component {
	state = { 
		// once you have migrated the project put the owner address here.
		ownerAddress: 0x160E462aFE77dad7f7094d20D1450D6E0555AA40,
		storageValue: 0, 
		web3: null, 
		accounts: null, 
		contract: null,
		ownerBalance: 0,
		betResult: {
			bool: null,
			message: null
		}
	};

	componentDidMount = async () => {
		try {
			const web3 = await getWeb3();
			const accounts = await web3.eth.getAccounts();
			const networkId = await web3.eth.net.getId();
			const coinInstance = new web3.eth.Contract(
				Coin.abi,
				Coin.networks[networkId] && Coin.networks[networkId].address,
			);

			this.setState({
				web3, 
				accounts, 
				contract: {
					coinInstance: coinInstance
				}
			});

			this.getOwnerBalance();

		} catch (error) {
			alert(`Failed to load web3, accounts, or contract. Check console for details.`);
			console.error(error);
		}
	};

	componentWillUpdate = async () => {
		if (this.state.contract != null) {
			this.getOwnerBalance();
		}
	}

	getOwnerBalance = async () => {
		let ownerBalance = await this.state.contract.coinInstance.methods.ownerBalance().call();
		this.setState({
			ownerBalance: this.state.web3.utils.fromWei(ownerBalance, 'ether')
		});
	}

	setOwnerBalance = async () => {
		await this.state.contract.coinInstance.methods
			.setOwnerBalance().send({
				from: this.state.accounts[0], 
				value: this.state.web3.utils.toWei("30", "ether")
			});

		this.updateOwnerBalance();
	}

	updateOwnerBalance = async () => {
		let ownerBalance = await this.state.contract.coinInstance.methods.ownerBalance().call();

		this.setState({
			ownerBalance: ownerBalance
		});
	}

	alerts = () => {
		switch (this.state.betResult.bool) {
			case true:
				return <div className="success">{this.state.betResult.message}</div>;
			case false:
				return <div className="danger">{this.state.betResult.message}</div>;
			default:
				return null;
		}
	}

	flipCoin = async (event) => {
		let result = await this.state.contract.coinInstance.methods
			.startBet()
			.send({
				from: this.state.accounts[0], 
				value: this.state.web3.utils.toWei(event.target.value, "ether")
			});
		this.setState({
			betResult: {
				bool: result.events.betResult.returnValues[0],
				message: result.events.betResult.returnValues[1]
			}
		});
	}

	render() {
		if (!this.state.web3) {
			return <div>Loading Web3, accounts, and contract...</div>;
		}
		return (
			<div className="App">
				<Nav/>
				<div className="center">
					<h2>Etherium</h2>
					<img width="100px" src={ require('./eth-image.png') } />
					<p onChange={this.getOwnerBalance}>{this.state.ownerBalance} ETH AVAILABLE</p>
		            <div>{this.alerts()}</div>
					<br />
					<button className="button" onClick={this.flipCoin} value="1" name="1eth">1 Eth</button>
					<button className="button" onClick={this.flipCoin} value="2" name="2eth">2 Eth</button>
					<button className="button" onClick={this.flipCoin} value="3" name="3eth">3 Eth</button>
					<br />
					<br />
					{ this.state.ownerAddress == this.state.accounts[0] ? 
						<button onClick={this.setOwnerBalance}>Add 30 ether to owner balance</button> : 
						''
					}
				</div>
			</div>
		);
	}
}

export default App;
