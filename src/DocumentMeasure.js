import React from 'react';
import PropTypes from 'prop-types';
import { Measure } from 'react-measure';

DocumentMeasure.propTypes = {
  children: PropTypes.func.isRequired,
  defaultWidth: PropTypes.number,
  defaultHeight: PropTypes.number,
};

function DocumentMeasure({ children, defaultWidth = 0, defaultHeight = 0 }) {
  return <div>{children({ width: defaultWidth, height: defaultHeight })}</div>;
  return (
    <Measure>
      {({ bind, measurements }) => (
        <div {...bind('document')} style={{ flexGrow: 1 }}>
          {children(
            measurements
              ? measurements.document
              : { width: defaultWidth, height: defaultHeight }
          )}
        </div>
      )}
    </Measure>
  );
}

export default DocumentMeasure;
