import React, { useState } from 'react';
import { Button, Card, CardImg, Col, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';

import twoImg from '../assets/img/staking 2 days.png';
import fifImg from '../assets/img/staking 15 days.png';
import thirImg from '../assets/img/staking 30 days.png';


export default function MyNFTs({ data, loading, stakeNFT }) {

  const [isOpen, setIsOpen] = useState(false);
  const [nft, setNft] = useState(null);

  const toggleModal = () => {
    setIsOpen(!isOpen)
  }

  const handleModal = (val) => {
    setNft(val);
    toggleModal();
  }

  const stake = (date) => {
    stakeNFT(nft, date)
    toggleModal();
  }

  return (
    <div>
      {
        loading ? <h5 className='red-text text-center mv-25'>LOADING YOUR NFTS...</h5>
          : <Row className={'justify-center'}>
            {data && data.length > 0 ? data.map((val, ind) => {
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
                      onClick={() => handleModal(val)}
                      className="nft-button red-text"
                    >
                      CLICK TO STAKE
                    </Button>
                  </Card>
                </Col>
              );
            }) : <h5 className='red-text text-center mv-25' style={{ marginTop: "25px" }}>THERE IS NO NFTS.</h5>}
          </Row>
      }
      <Modal
        isOpen={isOpen}
        toggle={toggleModal}
        size="lg"
        centered
      >
        <ModalHeader className='red-text justify-content-center'>Select Your Duration</ModalHeader>
        <ModalBody>
          <div className='d-flex justify-content-between align-items-center duration-dates'>
            <div className="duration-tile" onClick={() => stake(2)} >
              <h1 alt="Stake 2 days.">
                2 Days
              </h1>
              <span>You can claim Rewards after 2 days.</span>
            </div>
            <div className="duration-tile" onClick={() => stake(15)} >
              <h1 alt="Stake 15 days.">
                15 Days
              </h1>
              <span>You can claim Rewards after 15 days.</span>
            </div>
            <div className="duration-tile" onClick={() => stake(30)} >
              <h1 alt="Stake 30 days.">
                30 Days
              </h1>
              <span>You can claim Rewards after 30 days.</span>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}
