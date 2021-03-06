import React from "react";
import { compose } from 'redux';
import { connect } from "react-redux";
import { Redirect } from 'react-router-dom';

class Register extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      wording: this.props.wording,
      form: {
        username: '',
        email: '',
        passwd: '',
        passwdconf: '',
      }
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.nameInput.focus();
  }

  handleChange(event) {
    this.setState({
      form: {
        username: event.target.name === 'username' ? event.target.value : this.state.form.username,
        email: event.target.name === 'email' ? event.target.value : this.state.form.email,
        passwd: event.target.name === 'passwd' ? event.target.value : this.state.form.passwd,
        passwdconf: event.target.name === 'passwdconf' ? event.target.value : this.state.form.passwdconf,
      }
    });
    event.preventDefault();
  }

  handleSubmit(e) {
    if (this.state.form.username
      && this.state.form.email
      && this.state.form.passwd
      && this.state.form.passwdconf) {
      this.props.dispatch(this.props.createCred(this.state.form));
    }
    e.preventDefault();
  }

  componentWillMount() {
    this.setState({
      wording: this.props.wording,
      form: {
        username: this.state.form.username,
        email: this.state.form.email,
        passwd: this.state.form.passwd,
        passwdconf: this.state.form.passwdconf
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      wording: nextProps.wording ? nextProps.wording : this.props.wording,
      user: nextProps.user ? nextProps.user : this.props.user
    });
  }

  render() {
    if (this.state.user && this.state.user.uid) {
      return (
        <Redirect to={{
          pathname: '/',
        }} />
      )
    }
    return (
      <div className="container">
        <div className="Content title">
          <form onSubmit={this.handleSubmit}>
            <div className="row">
              <div className="form-group col-sm-12">
                <label>Choose your nickname</label>
                <input ref={(input) => { this.nameInput = input; }} value={this.state.form.username} onChange={this.handleChange} name="username" type="text" className="form-control" placeholder="user" />
              </div>
              <div className="form-group col-sm-12">
                <label>Provide your email</label>
                <input value={this.state.form.email} onChange={this.handleChange} name="email" type="email" className="form-control" placeholder="email" />
              </div>
              <div className="form-group col-sm-6">
                <label>Enter your passwd</label>
                <input value={this.state.form.passwd} onChange={this.handleChange} name="passwd" type="password" className="form-control" placeholder="****************" />
              </div>
              <div className="form-group col-sm-6">
                <label>Confirm passwd</label>
                <input value={this.state.form.passwdconf} onChange={this.handleChange} name="passwdconf" type="password" className="form-control" placeholder="****************" />
              </div>
            </div>
            <div className="ContentCenter" style={{ marginBottom: '20px' }}>
              <button type="submit" className="btn btn-primary">
                {this.state.wording.cta}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default compose(connect(state => ({
  wording: state.lang.wording.welcome,
  user: state.user.user
}))(Register));
