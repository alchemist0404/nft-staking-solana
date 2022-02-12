import React from 'react';
import { Button, Card, CardImg, Col, Row } from 'reactstrap';

export default function InStake({ data, loading, unStakeNFT }) {
  return (
    <div>
      {
        loading ? <h5 className='red-text text-center mv-25'>LOADING STAKED NFTS...</h5>
        : <Row className={'justify-center'}>
            {
              data && data.length > 0 ? data.map((val, ind) => {
                return (
                  <Col key={ind} xs="6" sm="6" md="4" lg="3" xl="3" style={{ textAlign: 'center' }}>
                    <Card className={"nft-card"}>
                      <CardImg
                        src={val.data.image}
                        top
                        width="100px"
                        alt="Not found"
                        className='nft-img'
                      />
                      <h4 className='digital red-text'>{val.data.name}</h4>
                      <Button
                        color="info"
                        outline
                        onClick={() => unStakeNFT(val)}
                        className="nft-button red-text"
                      >
                        UNSTAKE
                      </Button>
                    </Card>
                  </Col>
                );
              }) : <h5 className='red-text text-center mv-25' style={{ marginTop: "25px" }}>THERE IS NO STAKED NFTS.</h5>
            }
          </Row>
      }
    </div>
  );
}
