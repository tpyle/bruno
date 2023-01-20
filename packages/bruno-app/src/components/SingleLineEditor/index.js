import React, { Component } from 'react';
import isEqual from 'lodash/isEqual';
import { getEnvironmentVariables } from 'utils/collections';
import { defineCodeMirrorBrunoVariablesMode } from 'utils/common/codemirror';
import StyledWrapper from './StyledWrapper';

let CodeMirror;
const SERVER_RENDERED = typeof navigator === 'undefined' || global['PREVENT_CODEMIRROR_RENDER'] === true;

if (!SERVER_RENDERED) {
  CodeMirror = require('codemirror');
}

class SingleLineEditor extends Component {
  constructor(props) {
    super(props);
    this.editorRef = React.createRef();
    this.variables = {};
  }
  componentDidMount() {
    // Initialize CodeMirror as a single line editor
    this.editor = CodeMirror(this.editorRef.current, {
      lineWrapping: false,
      lineNumbers: false,
      autofocus: true,
      mode: "brunovariables",
      extraKeys: {
        "Enter": () => {},
        "Ctrl-Enter": () => {},
        "Cmd-Enter": () => {},
        "Alt-Enter": () => {},
        "Shift-Enter": () => {}
      },
    });
    this.editor.setValue(this.props.value)

    this.editor.on('change', (cm) => {
      this.props.onChange(cm.getValue());
    });
    this.addOverlay();
  }

  componentDidUpdate(prevProps) {
    let variables = getEnvironmentVariables(this.props.collection);
    if (!isEqual(variables, this.variables)) {
      this.addOverlay();
    }
  }

  componentWillUnmount() {
    this.editor.getWrapperElement().remove();
  }

  addOverlay = () => {
    let variables = getEnvironmentVariables(this.props.collection);
    this.variables = variables;

    defineCodeMirrorBrunoVariablesMode(variables, "text/plain");
    this.editor.setOption('mode', 'brunovariables');
  }

  render() {
    return (
      <StyledWrapper ref={this.editorRef} className="single-line-editor"></StyledWrapper>
    );
  }
}
export default SingleLineEditor;