import React from 'react';
import PropTypes from 'prop-types';

const pdfjsViewer = window['pdfjs-dist/web/pdf_viewer'];

class DocumentView extends React.Component {
  static propTypes = {
    index: PropTypes.number,
    style: PropTypes.object,
    data: PropTypes.any,
  };

  state = {
    page: null,
    width: 0,
    height: 0,
  };

  container = React.createRef();

  componentDidMount() {
    const {
      data: { documentBody, documentZoom: scale },
      index,
    } = this.props;

    const pageNumber = index + 1;

    documentBody.getPage(pageNumber).then((page) => {
      const { current: container } = this.container;
      const viewport = page.getViewport(scale);
      const { width, height } = viewport;

      this.setState({ page, width, height }, () => {
        const textLayerFactory = new pdfjsViewer.DefaultTextLayerFactory();
        const annotationLayerFactory =
          new pdfjsViewer.DefaultAnnotationLayerFactory();
        const pageView = new pdfjsViewer.PDFPageView({
          container,
          id: pageNumber,
          scale,
          defaultViewport: page.getViewport(scale),
          textLayerFactory,
          annotationLayerFactory,
        });

        pageView.setPdfPage(page);
        pageView.draw();
      });
    });
  }

  render() {
    const { width, height } = this.state;
    const { style } = this.props;

    return (
      <div style={style}>
        <div ref={this.container} width={width} height={height} />
      </div>
    );
  }
}

export default DocumentView;
