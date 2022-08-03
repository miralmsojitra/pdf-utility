import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import * as PdfJs from 'pdfjs-dist';
import { FixedSizeList as Document } from 'react-window';

import DocumentView from './DocumentView.js';
import DocumentSize from './DocumentMeasure';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
// import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.js';

PdfJs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import styles from './styles.module.css';

class App extends React.Component {
  static displayName = 'Viewer';

  static propTypes = {
    initialScrollOffset: PropTypes.number,
  };

  static defaultProps = {
    initialScrollOffset: 0,
  };

  state = {
    pdfContent: 'test',
    documentBody: {},
    documentSize: {
      width: 0,
      height: 0,
    },
  };

  onFileChange = (e) => {
    const files = e.target.files;
    files.length > 0 &&
      this.setState({ fileURL: URL.createObjectURL(files[0]) }, () => {
        this.loadFile();
      });
  };

  // componentDidMount() {
  loadFile = () => {
    const { documentZoom } = this.state;

    PdfJs.getDocument(this.state.fileURL).promise.then((pdf) => {
      pdf.getPage(1).then((page) => {
        let content = page
          .getTextContent()
          .then((dt) => {
            console.log('--', dt);
            let cont = '';
            dt.items.map((i) => {
              cont = cont + ' ' + i.str;
              console.log(i.str);
            });
            return cont;
          })
          .then((content) => {
            console.log('--cont--', content);
            this.setState({
              documentBody: pdf,
              pdfContent: content,
            });
          });
      });
    });
  };

  render() {
    return (
      <div
        className={styles.viewer}
        tabIndex={0}
        style={{ width: '460px', height: '600px' }}
      >
        <input type="file" accept=".pdf" onChange={this.onFileChange} />
        {this.state.pdfContent}
      </div>
    );
  }
}

export default App;

// ReactDOM.render(<App />, document.getElementById('root'));
