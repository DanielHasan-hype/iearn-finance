import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import {
  Card,
  Typography,
  Button,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Switch,
  Select,
  MenuItem,
  FormControl
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { withNamespaces } from 'react-i18next';
import { colors } from '../../theme'

import BuiltWithModal from '../builtwith/builtwithModal.jsx'
import UnlockModal from '../unlock/unlockModal.jsx'
import Snackbar from '../snackbar'
import Loader from '../loader'
import InsuredAsset from './insuredAsset'

import {
  ERROR,
  GET_INSURANCE_BALANCES,
  GET_INSURANCE_BALANCES_RETURNED,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  GET_ETH_PRICE,
  BUY_INSURANCE_RETURNED
} from '../../constants'

import Store from "../../stores";
const emitter = Store.emitter
const dispatcher = Store.dispatcher
const store = Store.store

const styles = theme => ({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '1200px',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  insuranceContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    minWidth: '100%',
    [theme.breakpoints.up('md')]: {
      minWidth: '900px',
    }
  },
  intro: {
    width: '100%',
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  introCenter: {
    maxWidth: '500px',
    textAlign: 'center',
    display: 'flex',
    padding: '48px 0px'
  },
  introText: {
  },
  placeholder: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      width: '130px',
      display: 'block'
    }
  },
  addressContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    maxWidth: '100px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    fontSize: '0.83rem',
    textOverflow:'ellipsis',
    cursor: 'pointer',
    padding: '10px',
    borderRadius: '0.75rem',
    height: 'max-content',
    [theme.breakpoints.up('md')]: {
      maxWidth: '130px',
      width: '100%'
    }
  },
  connectContainer: {
    padding: '12px',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '450px',
    [theme.breakpoints.up('md')]: {
      width: '450',
    }
  },
  actionButton: {
    '&:hover': {
      backgroundColor: "#2F80ED",
    },
    padding: '12px',
    backgroundColor: "#2F80ED",
    borderRadius: '1rem',
    border: '1px solid #E1E1E1',
    fontWeight: 500,
    [theme.breakpoints.up('md')]: {
      padding: '15px',
    }
  },
  buttonText: {
    fontWeight: '700',
    color: 'white',
  },
  expansionPanel: {
    maxWidth: 'calc(100vw - 24px)',
    width: '100%'
  },
  heading: {
    display: 'none',
    paddingTop: '12px',
    flexShrink: 0,
    [theme.breakpoints.up('sm')]: {
      paddingTop: '5px',
      display: 'block',
      padding: '0px 12px'
    }
  },
  headingName: {
    paddingTop: '5px',
    flex: 1,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    minWidth: '100%',
    [theme.breakpoints.up('sm')]: {
      minWidth: 'auto',
    }
  },
  assetSummary: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    [theme.breakpoints.up('sm')]: {
      flexWrap: 'nowrap'
    }
  },
  assetIcon: {
    display: 'flex',
    alignItems: 'center',
    verticalAlign: 'middle',
    borderRadius: '20px',
    height: '30px',
    width: '80px',
    textAlign: 'center',
    cursor: 'pointer',
    marginRight: '20px',
    [theme.breakpoints.up('sm')]: {
      height: '40px',
      width: '100px',
      marginRight: '24px',
    }
  },
});

class Insure extends Component {

  constructor(props) {
    super()

    this.state = {
      assets: store.getStore('insuranceAssets'),
      account: store.getStore('account'),
      languages: store.getStore('languages'),
      language: 'en',
      modalOpen: false,
      modalInvestAllOpen: false,
      snackbarType: null,
      snackbarMessage: null,
    }
  }
  componentWillMount() {
    emitter.on(ERROR, this.errorReturned);
    emitter.on(GET_INSURANCE_BALANCES_RETURNED, this.balancesReturned);
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(BUY_INSURANCE_RETURNED, this.buyInsuranceReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(GET_INSURANCE_BALANCES_RETURNED, this.balancesReturned);
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.removeListener(BUY_INSURANCE_RETURNED, this.buyInsuranceReturned);
  };

  refresh() {
    dispatcher.dispatch({ type: GET_INSURANCE_BALANCES, content: {} });
    dispatcher.dispatch({ type: GET_ETH_PRICE, content: {} });
  }

  buyInsuranceReturned = (txHash) => {
    const snackbarObj = { snackbarMessage: null, snackbarType: null }
    this.setState(snackbarObj)
    this.setState({ loading: false })
    const that = this
    setTimeout(() => {
      const snackbarObj = { snackbarMessage: txHash, snackbarType: 'Hash' }
      that.setState(snackbarObj)
    })
  };

  balancesReturned = (balances) => {
    this.setState({ assets: store.getStore('insuranceAssets') })
    setTimeout(this.refresh,15000);
  };

  connectionConnected = () => {
    this.setState({ account: store.getStore('account') })

    dispatcher.dispatch({ type: GET_INSURANCE_BALANCES, content: {} });
    dispatcher.dispatch({ type: GET_ETH_PRICE, content: {} });

    const that = this
    setTimeout(() => {
      const snackbarObj = { snackbarMessage: 'Wallet succesfully connected.', snackbarType: 'Info' }
      that.setState(snackbarObj)
    })
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore('account') })
  }

  errorReturned = (error) => {
    const snackbarObj = { snackbarMessage: null, snackbarType: null }
    this.setState(snackbarObj)
    this.setState({ loading: false })
    const that = this
    setTimeout(() => {
      const snackbarObj = { snackbarMessage: error.toString(), snackbarType: 'Error' }
      that.setState(snackbarObj)
    })
  };

  render() {
    const { classes, t } = this.props;
    const {
      loading,
      account,
      modalOpen,
      snackbarMessage,
      languages,
      language
    } = this.state

    var address = null;
    if (account.address) {
      address = account.address.substring(0,6)+'...'+account.address.substring(account.address.length-4,account.address.length)
    }

    return (
      <div className={ classes.root }>
        <div className={ classes.insuranceContainer }>
          { account.address &&
            <div className={ classes.intro }>
              <div className={ classes.placeholder }>
              </div>
              <Typography variant='h2' className={ classes.introText }>{ t('Insure.Intro') }</Typography>
              <Card className={ classes.addressContainer } onClick={this.overlayClicked}>
                <Typography variant={ 'h5'} noWrap>{ address }</Typography>
                <div style={{ background: '#DC6BE5', opacity: '1', borderRadius: '10px', width: '10px', height: '10px', marginRight: '3px', marginTop:'3px', marginLeft:'6px' }}></div>
              </Card>
            </div>
          }
          { !account.address &&
            <div className={ classes.introCenter }>
              <Typography variant='h2'>{ t('Insure.Intro') }</Typography>
            </div>
          }

          {!account.address &&
            <div className={ classes.connectContainer }>
              <Button
                className={ classes.actionButton }
                variant="outlined"
                color="primary"
                disabled={ loading }
                onClick={ this.overlayClicked }
                >
                <Typography className={ classes.buttonText } variant={ 'h5'}>{ t('InvestSimple.Connect') }</Typography>
              </Button>
            </div>
          }
          { account.address && this.renderAssetBlocks() }
        </div>
        { loading && <Loader /> }
        { modalOpen && this.renderModal() }
        { snackbarMessage && this.renderSnackbar() }
      </div>
    )
  };

  onChange = (event) => {
    let val = []
    val[event.target.id] = event.target.checked
    this.setState(val)
  };

  renderAssetBlocks = () => {
    const { assets, expanded } = this.state
    const { classes, t } = this.props
    const width = window.innerWidth

    return assets.map((asset) => {
      return (
        <ExpansionPanel className={ classes.expansionPanel } square key={ asset.id+"_expand" } expanded={ expanded === asset.id} onChange={ () => { this.handleChange(asset.id) } }>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <div className={ classes.assetSummary }>
              <div className={classes.headingName}>
                <div className={ classes.assetIcon }>
                  <img
                    alt=""
                    src={ require('../../assets/oCurve-logo.svg') }
                    height={ width > 600 ? '30px' : '25px'}
                    style={asset.disabled?{filter:'grayscale(100%)'}:{}}
                  />
                </div>
                <div>
                  <Typography variant={ 'h3' }>{ asset.name }</Typography>
                  <Typography variant={ 'h5' }>{ asset.description }</Typography>
                </div>
              </div>
              <div className={classes.heading}>
                <Typography variant={ 'h3' }>{ (asset.balance ? (asset.balance).toFixed(4) : '0.0000')+' '+( asset.tokenSymbol ? asset.tokenSymbol : asset.symbol ) }</Typography>
                <Typography variant={ 'h5' }>{ t('Insure.Balance') }</Typography>
              </div>
              <div className={classes.heading}>
                <Typography variant={ 'h3' }>{ (asset.balance > 0 ? (asset.insuredBalance  * 100 / (asset.insuredBalance + asset.balance)).toFixed(4) : '0.0000')+' %'}</Typography>
                <Typography variant={ 'h5' }>{ t('Insure.Insured') }</Typography>
              </div>
              { /* <div className={classes.heading}>
                <Typography variant={ 'h3' }>{ (asset.maxApr*100).toFixed(4)+' %'}</Typography>
                <Typography variant={ 'h5' }>{ t('Insure.UninsuredYield') }</Typography>
              </div>
              <div className={classes.heading}>
                <Typography variant={ 'h3' }>{ (asset.insuredApr*100).toFixed(4)+' %'}</Typography>
                <Typography variant={ 'h5' }>{ t('Insure.InsuredYield') }</Typography>
              </div> */}
            </div>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <InsuredAsset asset={ asset } />
          </ExpansionPanelDetails>
        </ExpansionPanel>
      )
    })
  }

  handleChange = (id) => {
    this.setState({ expanded: this.state.expanded === id ? null : id })
  }

  startLoading = () => {
    this.setState({ loading: true })
  }

  renderSnackbar = () => {
    var {
      snackbarType,
      snackbarMessage
    } = this.state
    return <Snackbar type={ snackbarType } message={ snackbarMessage } open={true}/>
  };

  renderModal = () => {
    return (
      <UnlockModal closeModal={ this.closeModal } modalOpen={ this.state.modalOpen } />
    )
  }

  overlayClicked = () => {
    this.setState({ modalOpen: true })
  }

  closeModal = () => {
    this.setState({ modalOpen: false })
  }
}

export default withNamespaces()(withRouter(withStyles(styles)(Insure)));
