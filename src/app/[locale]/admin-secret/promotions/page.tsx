import { getPromotionRequests, getPromotedProducts, approvePromotion, rejectPromotionRequest, revokePromotion } from './actions';
import { PromotionsClient } from './PromotionsClient';

export default async function PromotionsPage() {
  const [requests, promoted] = await Promise.all([
    getPromotionRequests(),
    getPromotedProducts(),
  ]);
  return (
    <PromotionsClient
      requests={requests}
      promoted={promoted}
      approvePromotion={approvePromotion}
      rejectPromotionRequest={rejectPromotionRequest}
      revokePromotion={revokePromotion}
    />
  );
}
