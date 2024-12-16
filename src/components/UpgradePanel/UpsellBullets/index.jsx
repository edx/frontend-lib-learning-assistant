import PropTypes from 'prop-types';
import {
  VerifiedCertBullet,
  UnlockGradedBullet,
  FullAccessBullet,
  XpertAccessBullet,
} from './UpsellBullets';

const UpsellContent = ({ isFBE }) => (
  <div role="list" className="pl-4 text-white pt-0 my-4">
    <XpertAccessBullet />
    <VerifiedCertBullet />
    {isFBE && (
      <>
        <UnlockGradedBullet />
        <FullAccessBullet />
      </>
    )}
  </div>
);

UpsellContent.defaultProps = {
  isFBE: false,
};

UpsellContent.propTypes = {
  isFBE: PropTypes.bool,
};

export default UpsellContent;
