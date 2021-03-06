import React from "react";
import { compose } from 'redux';
import { connect } from "react-redux";
import { Redirect } from 'react-router-dom';

class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      wording: this.props.wording,
      form: {
        email: '',
        passwd: '',
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
        email: event.target.name === 'email' ? event.target.value : this.state.form.email,
        passwd: event.target.name === 'passwd' ? event.target.value : this.state.form.passwd,
      }
    });
    event.preventDefault();
  }

  handleSubmit(e) {
    if (this.state.form.email && this.state.form.passwd) {
      this.props.dispatch(this.props.getCred(this.state.form));
    }
    e.preventDefault();
  }

  componentWillMount() {
    this.setState({
      wording: this.props.wording,
      form: {
        email: this.state.form.email,
        passwd: this.state.form.passwd
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
              <div className="form-group col-sm-6">
                <label>Email</label>
                <input ref={(input) => { this.nameInput = input; }} value={this.state.form.email} onChange={this.handleChange} name="email" type="email" className="form-control" placeholder="user" />
              </div>
              <div className="form-group col-sm-6">
                <label>Password</label>
                <input value={this.state.form.passwd} onChange={this.handleChange} name="passwd" type="password" className="form-control" placeholder="****************" />
              </div>
            </div>
            <div className="ContentCenter" style={{ marginBottom: '20px' }}>
              <button type="submit" className="btn btn-primary">
                Log In
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
}))(Login));
