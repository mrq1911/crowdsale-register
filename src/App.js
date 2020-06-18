import React, {Component} from 'react';
import AppBar from '@material-ui/core/AppBar';
import {withStyles} from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Signal4 from '@material-ui/icons/SignalCellular4Bar';
import SignalOff from '@material-ui/icons/SignalCellularOff';
import Backdrop from '@material-ui/core/Backdrop';
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Moment from 'moment';
import Check from './Check';
import Web3 from 'web3';
import CrowdsaleRegister from "./CrowdsaleRegister.abi";

const styles = theme => ({
	root: {
		overflowX: 'auto',
		flexGrow: 1,
	},
	grid: {
		paddingTop: theme.spacing.unit * 3,
		paddingBottom: theme.spacing.unit * 3,
		[theme.breakpoints.up('sm')]: {
			...theme.mixins.gutters(),
		},
	},
	gutter: {
		...theme.mixins.gutters(),
		paddingTop: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit * 2,
	},
	input: {
		width: '100%',
	},
	table: {
		tableLayout: 'auto',
		minWidth: 700,
	},
	flex: {
		flex: 1,
	},
	backdrop: {
		backgroundColor: '#eeeeee',
	},
});

const providerUrl = "https://rinkeby.infura.io";
const crowdsaleRegisterAddress = "0xC03A60Da7EbA51b88fc9E41f00260153A38e3D9A";

class App extends Component {

	state = {
		isConnected: false,
		peers: 0,
		events: [],
		selectedAddress: ''
	};

	constructor(props) {
		super(props);
		//this.web3 = new Web3(new Web3.providers.WebsocketProvider(providerUrl));
		this.web3 = new Web3(window.web3.currentProvider);
		this.crowdsaleRegister = new this.web3.eth.Contract(CrowdsaleRegister, crowdsaleRegisterAddress);
	}

	async componentWillMount() {
		let connection = await this.web3.eth.net.isListening();
		let contractFound = await this.crowdsaleRegister.methods.owner().call();
		if (this.web3 && connection && contractFound) {
			await this.updateData();
			this.crowdsaleRegister.events.allEvents({fromBlock: 'latest'}, e => this.updateData());
		}
	}

	timeEvent = (event) => {
		return this.web3.eth.getBlock(event.date).then(block => {
			event.date = Moment.unix(block.timestamp).fromNow();
			return event;
		});
	};

	loadEvents = async () => {
		let id = -1;

		function createData(type, name, address, date) {
			id += 1;
			return {id, type, name, address, date};
		}

		let events = await this.crowdsaleRegister.getPastEvents('allEvents', {
			fromBlock: 0,
			toBlock: 'latest'
		});
		events = events.reverse().map(e => createData(e.event, '', e.returnValues[0], e.blockNumber));
		return Promise.all(events.map(e => this.timeEvent(e)));
	};

	updateData = async () => {
		this.setState({
			isConnected: true,
			peers: await this.web3.eth.net.getPeerCount(),
			events: await this.loadEvents()
		});
	};

	selectAddress = (address) => {
		this.setState((prevState) => {
			return Object.assign(prevState, {selectedAddress: address});
		});
	};

	render() {
		const {classes} = this.props;
		return (
				<div>
					<AppBar position="static">
						<Toolbar>
							<Typography variant="title" color="inherit" className={classes.flex}>
								Crowdsale Register
							</Typography>
							<div>
								<Tooltip id="tooltip"
								         title={this.state.isConnected ? `Connected to ${this.state.peers} peers` : 'Not Connected'}>
									<IconButton color="inherit">
										{this.state.isConnected ? <Signal4/> : <SignalOff/>}
									</IconButton>
								</Tooltip>
							</div>
						</Toolbar>
					</AppBar>
					<Backdrop className={classes.backdrop} open={true}/>
					<Grid container spacing={24} className={classes.grid}>
						<Grid item md={4} xs={12}>
							<Check crowdsaleRegister={this.crowdsaleRegister} selectedAddress={this.state.selectedAddress}/>
						</Grid>
						<Grid item md={8} xs={12}>
							<Paper className={classes.root} elevation={1}>
								<Typography className={classes.gutter} variant="headline" component="h3">
									Recent events
								</Typography>
								<Table className={classes.table}>
									<TableHead>
										<TableRow>
											<TableCell>Event</TableCell>
											<TableCell>Address</TableCell>
											<TableCell>Date</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{this.state.events.map(n => {
											return (
													<TableRow key={n.id} hover onClick={_ => this.selectAddress(n.address)}>
														<TableCell component="th" scope="row">{n.type}</TableCell>
														<TableCell>{n.address}</TableCell>
														<TableCell>{n.date}</TableCell>
													</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</Paper>
						</Grid>
					</Grid>
				</div>
		);
	}
}

export default withStyles(styles)(App);
