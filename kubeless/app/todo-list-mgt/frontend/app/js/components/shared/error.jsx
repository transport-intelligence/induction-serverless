import React, { Component } from 'react';
import { connect } from 'react-redux';
import { resetError } from '../../actions/error';

const styles = {
  backgroundColor: '#FC9D9A',
  padding: '1em',
  marginBottom: '1em'
};

class Error extends Component {
  componentDidMount() {
    setTimeout(() => {
      this.props.resetError();
    }, 5000);
  }

  handleDismissClick(event) {
    event.preventDefault();
    this.props.resetError();
  }

  render() {
    const { message } = this.props;

    if (!message.length) {
      return null;
    }

    return (
      <div className="row">
        <div className="twelve columns" style={styles}>
          An error occurred: "{message}"
          <a href="#" onClick={this.handleDismissClick.bind(this)} className="u-pull-right">Dismiss</a>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ error }) => ({ message: error.message });

export default connect(mapStateToProps, { resetError })(Error);
