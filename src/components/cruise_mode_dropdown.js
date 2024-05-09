import React, { Component, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import PropTypes from 'prop-types';

// eslint-disable-next-line react/display-name
const CruiseModeDropdownToggle = React.forwardRef(
  ({ children, onClick }, ref) => {

    return (
      <span
        className="text-primary dropdown-toggle"
        ref={ref}
        onClick={e => {
          e.preventDefault();
          onClick(e);
        }}
      >
        {children}
      </span>
    );
  }
);

// eslint-disable-next-line react/display-name
const CruiseModeDropdownMenu = React.forwardRef(
  ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {

    // eslint-disable-next-line no-unused-vars
    const [value, setValue] = useState('');

    return (
      <div
        ref={ref}
        style={style}
        className={className}
        aria-labelledby={labeledBy}
      >
        {React.Children.toArray(children).filter(
          child =>
            !value || child.props.children.toLowerCase().startsWith(value),
        )}
      </div>
    );
  }
);

class CruiseModeDropdown extends Component {

  render() {

    return (
      <Dropdown className="no-arrow" id="dropdown-custom-menu">
        <Dropdown.Toggle as={CruiseModeDropdownToggle}>{(this.props.active_mode) ? this.props.active_mode : 'Loading...'}</Dropdown.Toggle>
        <Dropdown.Menu as={CruiseModeDropdownMenu}>
          {this.props.modes.map((mode, index) => (<Dropdown.Item className="text-primary" onClick={() => this.props.onClick(mode)} key={index}>{mode}</Dropdown.Item>))}
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}

CruiseModeDropdown.propTypes = {
  active_mode: PropTypes.string.isRequired,
  modes: PropTypes.array.isRequired,
  onClick: PropTypes.func
};

export default CruiseModeDropdown;
