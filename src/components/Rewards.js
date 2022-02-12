import React from 'react';
import { Button, Col, Row } from 'reactstrap';

export default function Rewards({ totalStaked, stakeUser, dailyRewards, pendingRewards, claimRewards }) {
  return (
    <Row style={{ marginTop: '25px' }}>
      <Col>
        <div className="pendding-rewards">Total Staked: {totalStaked} NFTs</div>
        <div className="pendding-rewards">My Total Staked: {stakeUser ? stakeUser.nftMints.length : 0} NFTs</div>
        <div className="pendding-rewards">Daily Rewards: {dailyRewards} $BNTY</div>
        <div className="pendding-rewards">Pending Rewards: {pendingRewards} $BNTY</div>
      </Col>
      <Col style={{ display: 'flex', alignItems: 'center', justifyContent: "center" }}>
        <Button className="btn-claim" onClick={() => claimRewards()}>Claim Rewards</Button>
      </Col>
    </Row>
  );
}
