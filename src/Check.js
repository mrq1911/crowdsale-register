import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import FormControl from "@material-ui/core/es/FormControl/FormControl";
import FormHelperText from "@material-ui/core/es/FormHelperText/FormHelperText";
import Pending from '@material-ui/icons/HourglassEmpty';
import Success from '@material-ui/icons/Check';
import Block from '@material-ui/icons/Block';
import CardHeader from "@material-ui/core/es/CardHeader/CardHeader";

const styles = theme => ({
	card: {
		marginBottom: theme.spacing.unit * 2,
		textOverflow: 'ellipsis'
	},
	gutter: {
		...theme.mixins.gutters(),
		paddingTop: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit * 2,
	},
	input: {
		width: '100%',
	},
});

class Check extends Component {

	state = {
		value: null,
		result: null,
		error: false,
		transactions: []
	};

	constructor(props) {
		super(props);
		this.state.value = props.selectedAddress;
		this.crowdsaleRegister = props.crowdsaleRegister;
	}

	componentWillReceiveProps(nextProps) {
		this.setValue(nextProps.selectedAddress);
	}

	async componentWillMount() {
		this.handler = await this.crowdsaleRegister.methods.handler().call();
	}

	setValue = (value) => {
		this.setState({value}, () => {
			this.check(value);
		});
	};

	check = async (address) => {
		try {
			let result = null;
			let msg = null;
			let pending = this.state.transactions.filter(t => t.address === address && t.status === "pending").length;
			if (pending) {
			} else if (address.length === 42) {
				result = await this.crowdsaleRegister.methods.approved(address).call();
				msg = result ? "Address is already an approved investor." : "Not yet an approved investor.";
			}
			this.setState({result, msg, error: false});
		} catch (e) {
			this.setState({result: null, error: true, msg: e.toString()})
		}
	};

	updatedTransactions = (transaction) => {
		return this.state.transactions.map(t => {
			return t.id === transaction.id ? transaction : t;
		});
	};

	submitTransaction = async (msg, fx) => {
		let transaction = {
			id: this.state.transactions.length,
			address: this.state.value,
			status: "pending",
			msg
		};
		try {
			this.setState({
				result: null,
				msg: null,
				transactions: [transaction].concat(this.state.transactions)
			});
			console.log(await fx.send({from: this.handler}));
			this.setState({
				transactions: this.updatedTransactions(Object.assign(transaction, {
					status: "success"
				}))
			});
		} catch (e) {
			this.setState({
				transactions: this.updatedTransactions(Object.assign(transaction, {
					status: "fail",
					error: e.toString()
				}))
			});
		}
	};

	approveAddress = async () => {
		await this.submitTransaction("Approve investor",
				this.crowdsaleRegister.methods.approve(this.state.value));
	};

	removeAddress = async () => {
		await this.submitTransaction("Remove investor",
				this.crowdsaleRegister.methods.remove(this.state.value));
	};

	render() {
		const {classes} = this.props;
		let msg;
		let approved = this.state.result;
		if (this.state.msg) {
			msg = this.state.msg;
		}
		return (
				<div>
					<Card className={classes.card}>
						<Typography variant="headline" className={classes.gutter} component="h3">
							Register an address
						</Typography>
						<Typography className={classes.gutter} variant="body1">
							Check, approve or remove address as an investor.
						</Typography>
						<div className={classes.gutter}>
							<FormControl className={classes.input} error={this.state.error} aria-describedby="name-error-text">
								<Input value={this.state.value} onChange={e => this.setValue(e.target.value)}
								       placeholder="Address"
								       className={classes.input}
								       inputProps={{'aria-label': 'Description'}}/>
								<FormHelperText id="name-error-text">{msg}</FormHelperText>
							</FormControl>
						</div>
						<CardActions>
							<Button size="small" color="primary"
							        disabled={approved === null || approved === true}
							        onClick={this.approveAddress}>
								Approve
							</Button>
							<Button size="small" color="primary"
							        disabled={approved === null || approved === false}
							        onClick={this.removeAddress}>
								Remove
							</Button>
						</CardActions>
					</Card>

					{this.state.transactions.map(n => {
						let icons = {
							"success": (<Success/>),
							"fail": (<Block/>),
							"pending": (<Pending/>)
						};
						let error = n.error ?
								(<Typography className={classes.gutter} variant="body1">
									{n.error}
								</Typography>) : null;
						return (
								<Card key={n.id} className={classes.card}>
									<CardHeader
											avatar={icons[n.status]}
											title={n.msg}
											subheader={n.address}/>
									{error}
								</Card>);
					})}
				</div>
		);
	}
}

export default withStyles(styles)(Check);
