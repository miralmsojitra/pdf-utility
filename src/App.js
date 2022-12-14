import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import * as PdfJs from 'pdfjs-dist';
import { FixedSizeList as Document } from 'react-window';
import { PDFDocument } from 'pdf-lib';
import axios from 'axios';
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
    pdfItems: [],
    pdfData: [],
  };

  doFileUpload = () => {
    // Create an object of formData
    const formData = new FormData();

    formData.append('file', this.state.file, this.state.file.name);
    let apiURL = 'http://localhost:3010/upload';
    // let apiURL = 'https://brain.quickaitools.com/upload';

    axios
      .post(apiURL, formData)
      .then((resp) => {
        console.log('--dt--', resp.data.data);
        this.saveFile(resp.data.data);
      })
      .catch((er) => {
        console.log('--er--', er);
      });
  };

  saveFile = async (cropData) => {
    console.log('---test---');
    const arrayBuffer = await fetch(this.state.fileURL).then((res) =>
      res.arrayBuffer()
    );
    // console.log('--', arrayBuffer);
    const pdfDoc1 = await PDFDocument.load(arrayBuffer);
    const newPdfDoc = await PDFDocument.create();

    Promise.all(
      cropData
        .sort(function (a, b) {
          return b.pageNumber - a.pageNumber;
        })
        .map((cPage) => {
          return new Promise(async (resolve, reject) => {
            console.log('--cPage--', cPage.skuString);
            if (cPage.cropTop) {
              console.log('--Label--', cPage.cropTop);
              // let npage = await pdfDoc1.getPage(cPage.pageNumber - 1);
              const [npage] = await newPdfDoc.copyPages(pdfDoc1, [
                cPage.pageNumber - 1,
              ]);
              // let cropDiamentions = [0, 0, cPage.width, cPage.cropTop];
              if (cPage.skuString) {
                npage.drawText(cPage.skuString + ' (' + cPage.qty + ' )', {
                  size: 10,
                  x: cPage.width - 200,
                  y: cPage.cropTop + 10,
                  // x: cPage.width - 100,
                  // y: cPage.cropTop - 20,
                });
              }
              npage.setCropBox(
                0,
                cPage.cropTop,
                cPage.width,
                cPage.height - cPage.cropTop - 30
              );
              newPdfDoc.addPage(npage);
              resolve(true);
            } else {
              console.log('--Extra-page--', 'delete');
              resolve(true);
              // pdfDoc1.removePage(cPage.pageNumber - 1);
            }
          });
        })
    ).then(async (dt) => {
      const pdfBytes = await newPdfDoc.save();
      var blob = new Blob([pdfBytes], { type: 'application/pdf' });
      var link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'quickAItools-' + Date.now() + '-' + this.state.file.name; //'myFileName.pdf';
      link.click();
    });

    // npage.setCropBox(0, 0, 250, 500);

    // setTimeout(async () => {
    //   const pdfBytes = await pdfDoc1.save();
    //   var blob = new Blob([pdfBytes], { type: 'application/pdf' });
    //   var link = document.createElement('a');
    //   link.href = window.URL.createObjectURL(blob);
    //   link.download = 'myFileName.pdf';
    //   link.click();
    // }, 3000);
  };

  onFileChange = (e) => {
    const files = e.target.files;
    files.length > 0 &&
      this.setState(
        { fileURL: URL.createObjectURL(files[0]), file: files[0] },
        async () => {
          this.doFileUpload();
        }
      );
  };

  // generatePdfData = (pdf) => {
  //   let numPages = pdf._pdfInfo.numPages;
  //   // let pdfPages = []
  //   console.log('-numPages-', numPages);
  //   Array.from(Array(numPages).keys()).map((pagenum) => {
  //     let pageNumber = pagenum + 1;
  //     console.log('-pageNumber--', pageNumber);
  //     pdf.getPage(pageNumber).then((page) => {
  //       console.log('-page-', page);
  //       page.getTextContent().then((dt) => {
  //         console.log('--', dt);
  //         let foldfromItem = dt.items.filter((a) => {
  //           return a.str === 'Fold Here';
  //         })[0];
  //         let skuString = null;
  //         dt.items.map((a, idx) => {
  //           if (a.str === 'SKU:') {
  //             skuString = dt.items[idx + 1].str + dt.items[idx + 2].str;
  //           }
  //         })[0];
  //         console.log('--foldfromItem-', foldfromItem);
  //         this.state.pdfData.push({
  //           pageNumber,
  //           height: page.view[3],
  //           width: page.view[2],
  //           // items: dt.items,
  //           skuString,
  //           cropTop: foldfromItem ? foldfromItem?.transform[5] : 1,
  //         });
  //       });
  //     });
  //   });
  //   setTimeout(() => {
  //     this.saveFile();
  //   }, 3000);
  // };

  // componentDidMount() {
  // loadFile = () => {
  //   const { documentZoom } = this.state;

  //   PdfJs.getDocument(this.state.fileURL).promise.then((pdf) => {
  //     this.generatePdfData(pdf);
  //     console.log(pdf);
  //     // console.log(pdf._pdfInfo.numPages);

  //     // pdf.getPage(1).then((page) => {
  //     //   // console.log();
  //     //   this.state.documentSize.height = page.view[3];
  //     //   this.state.documentSize.width = page.view[2];

  //     //   let content = page
  //     //     .getTextContent()
  //     //     .then((dt) => {
  //     //       console.log('--', dt);
  //     //       this.state.pdfItems = dt.items;
  //     //       let cont = '';
  //     //       dt.items.map((i) => {
  //     //         cont = cont + ' ' + i.str;
  //     //         // console.log(i.str);
  //     //       });
  //     //       return cont;
  //     //     })
  //     //     .then((content) => {
  //     //       console.log('--cont--', content);
  //     //       this.setState({
  //     //         documentBody: pdf,
  //     //         pdfContent: content,
  //     //       });
  //     //     });
  //     // });
  //   });
  // };

  render() {
    return (
      <div className={styles.viewer} tabIndex={0}>
        <input type="file" accept=".pdf" onChange={this.onFileChange} />
        <button onClick={this.doFileUpload}> test </button>
        {this.state.pdfData
          .sort(function (a, b) {
            return b.pagenum - a.pagenum;
          })
          .reverse()
          .map((p) => {
            return (
              <div
                className={styles.viewer}
                tabIndex={0}
                style={{
                  width: p.width,
                  height: p.height,
                  position: 'relative',
                }}
              >
                {/* {this.state.pdfContent} */}
                {
                  // p.items.map((i) => {
                  //   return (
                  //     <div
                  //       style={{
                  //         position: 'absolute',
                  //         fontSize: i.transform[0],
                  //         left: i.transform[4],
                  //         top: this.state.documentSize.height - i.transform[5],
                  //       }}
                  //       title={i.transform.join(',')}
                  //     >
                  //       {i.str}
                  //       {/* {i.transform.join(',')} */}
                  //     </div>
                  //   );
                  // })
                }
              </div>
            );
          })}
      </div>
    );
  }
}

export default App;

// transform: Array[6]
// 0: 8
// 1: 0
// 2: 0
// 3: 8
// 4: 403

// ReactDOM.render(<App />, document.getElementById('root'));
