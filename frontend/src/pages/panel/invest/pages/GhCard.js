import React, { useState, useEffect } from "react";
import Webcam from "react-webcam";
import Dropzone from "react-dropzone";
import { Icon } from "../../../../components/Component";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import DocumentUpload1 from "../../../../images/icons/id-front.svg";
import DocumentUpload2 from "../../../../images/icons/id-back.svg";
import { Button, Card, Col, Row, FormGroup, Form, Spinner } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { VerifyCustomerGhanaCard } from "../../../../appRedux/actions/CustomerAction";
import { VERIFY_GHANA_CARD_RESET } from "../../../../appRedux/actions/type";
import Swal from "sweetalert2";
import {
  Block,
  BlockContent,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockImage,
  BlockTitle,
  PreviewAltCard,
  UserAvatar,
  OverlineTitle,
} from "../../../../components/Component";
import Logo from "../../../../assets/logo.png";
const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};
import "./kyc.css";
const Welcome = () => {
  const dispatch = useDispatch();
  const VerifyGhState = useSelector((state) => state.verifyGhanaCard);
  const history = useHistory();
  const { verifyloading, verifyerror, verify } = VerifyGhState;

  const [ghcardnumber, setGhCardNumber] = useState("");
  const [image, setImage] = useState("");
  const [files, setFiles] = useState([]);
  const [files2, setFiles2] = useState([]);
  const [hide, setHide] = useState(false);
  // handles ondrop function of dropzone
  const handleDropChange = (acceptedFiles, num, rejectFiles) => {
    if (rejectFiles[0]) {
      alert("File size exceeded")

    }
    if (num === 1) {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    } else {
      setFiles2(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    }
  };
  const webcamRef = React.useRef(null);

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  });

  // function to reset the form
  const resetForm = () => {
    setImage("");
  };

  const onFormSubmit = (submitData) => {
    let submittedData = {
      ghcardnumber: submitData.ghcardnumber,
      image: image,
      files,
      files2,
    };
    const frontimage = files;
    const backimage = files2;
    const formData = new FormData();
    if (!image) {
      Swal.fire({
        icon: "error",
        title: "Oops",
        text: "Please Provide Selfie Image",
        focusConfirm: false,
      })
    }
    if (!ghcardnumber) {
      Swal.fire({
        icon: "error",
        title: "Oops",
        text: "Please Provide Ghana Card Number",
        focusConfirm: false,
      })
    }
    let checkPin = (ghcardnumber.match(/\-/g) || []).length;
    if (checkPin != 2 && checkPin != 3) {
      return Swal.fire({
        icon: "error",
        title: "Oops",
        text: "Invalid Ghana Card Number",
        focusConfirm: false,
      })
    }

    if (!frontimage[0]) {
      Swal.fire({
        icon: "error",
        title: "Oops",
        text: "Please Provide Front Copy Image Of Your Ghana Card",
        focusConfirm: false,
      })
    }

    if (!backimage[0]) {
      Swal.fire({
        icon: "error",
        title: "Oops",
        text: "Please Provide Back Copy Image Of Your Ghana Card",
        focusConfirm: false,
      })
    }
    formData.append("frontimage", frontimage[0]);
    formData.append("backimage", backimage[0]);
    formData.append("image", image);
    formData.append("ghcardnumber", ghcardnumber);

    if (image && ghcardnumber && (checkPin = 2) && (checkPin = 3) && frontimage[0] && backimage[0]) {
      dispatch(VerifyCustomerGhanaCard(formData));
    }
    // reset();
    // resetForm()
  };

  useEffect(() => {
    //check save error
    if (verifyerror) {
      Swal.fire({
        icon: "error",
        title: "Oops",
        text: verifyerror,
        focusConfirm: false,
      }).then((value) => {
        dispatch({ type: VERIFY_GHANA_CARD_RESET });
      });
    }

    if (verify) {
      Swal.fire({
        icon: "success",
        title: "Great",
        text: verify,
        focusConfirm: false,
      }).then((value) => {
        dispatch({ type: VERIFY_GHANA_CARD_RESET });
        // history.push({pathname:'/'})
        window.location.href = "/";
      });
    } else {
    }
  }, [dispatch, verifyerror, verify]);

  const { errors, register, handleSubmit, reset } = useForm();
  const Enabled = () => {
    if (hide) {
      setHide(false)
      window.location.href = "/kyc/ghcard";
    } else {
      setHide(true)
    }
  }


  return (
    <React.Fragment>
      <Head title="Welcome"></Head>
      <Content size="lg">
        <BlockHead size="lg" className="wide-xs mx-auto">
          <BlockHeadContent className="text-center">
            <img src={Logo} className="logo-dark logo-img" />
            {/* <BlockDes>
              <p>
                Welcome to our <strong>DashLite React Crypto Dashboard</strong>. You are few steps away to complete your
                profile. These are required to buy and sell on our platform! Let’s start!
              </p>
            </BlockDes> */}
          </BlockHeadContent>
        </BlockHead>

        <Block>
          <Card className="card-custom-s1 card-bordered">
            <Row className="no-gutters">
              <Col lg="4">
                <div className="card-inner-group">
                  <div className="card-inner">
                    {/* <h5>Let’s Finish Registration</h5>
                    <p>Only few minutes required to complete your registration and set up your account.</p> */}
                  </div>
                  <div className="card-inner">
                    <ul className="list list-step">
                      <li className="list-step-done">Welcome Notes</li>
                      {/* <li className="list-step-done">Verify Ghana Card</li> */}
                      <li className="list-step-done">Verify Your Account</li>
                      <li className="list-step-current">Verify Ghana Card</li>
                      <li>Enjoy our digital services</li>
                    </ul>
                  </div>
                  <div className="card-inner">
                    <div className="align-center gx-3">
                      <div className="flex-item">
                        <div className="progress progress-sm progress-pill w-80px">
                          <div className="progress-bar" style={{ width: "95%" }}></div>
                        </div>
                      </div>
                      <div className="flex-item">
                        <span className="sub-text sub-text-sm text-soft">3/3 Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
              <Col lg="8">
                <div className="card-inner card-inner-lg h-100">
                  <div className="align-center flex-wrap flex-md-nowrap g-3 h-100">
                    <div className="block-image w-200px flex-shrink-0 order-first order-md-last">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 114 113.9">
                        <path
                          d="M87.84,110.34l-48.31-7.86a3.55,3.55,0,0,1-3.1-4L48.63,29a3.66,3.66,0,0,1,4.29-2.8L101.24,34a3.56,3.56,0,0,1,3.09,4l-12.2,69.52A3.66,3.66,0,0,1,87.84,110.34Z"
                          transform="translate(-4 -2.1)"
                          fill="#ED8B00"
                        ></path>
                        <path
                          d="M33.73,105.39,78.66,98.1a3.41,3.41,0,0,0,2.84-3.94L69.4,25.05a3.5,3.5,0,0,0-4-2.82L20.44,29.51a3.41,3.41,0,0,0-2.84,3.94l12.1,69.11A3.52,3.52,0,0,0,33.73,105.39Z"
                          transform="translate(-4 -2.1)"
                          fill="#ED8B00"
                        ></path>
                        <rect x="22" y="17.9" width="66" height="88" rx="3" ry="3" fill="#ffd100"></rect>
                        <rect x="31" y="85.9" width="48" height="10" rx="1.5" ry="1.5" fill="#fff"></rect>
                        <rect x="31" y="27.9" width="48" height="5" rx="1" ry="1" fill="#e3e7fe"></rect>
                        <rect x="31" y="37.9" width="23" height="3" rx="1" ry="1" fill="#ED8B00"></rect>
                        <rect x="59" y="37.9" width="20" height="3" rx="1" ry="1" fill="#ED8B00"></rect>
                        <rect x="31" y="45.9" width="23" height="3" rx="1" ry="1" fill="#ED8B00"></rect>
                        <rect x="59" y="45.9" width="20" height="3" rx="1" ry="1" fill="#ED8B00"></rect>
                        <rect x="31" y="52.9" width="48" height="3" rx="1" ry="1" fill="#e3e7fe"></rect>
                        <rect x="31" y="60.9" width="23" height="3" rx="1" ry="1" fill="#ED8B00"></rect>
                        <path
                          d="M98.5,116a.5.5,0,0,1-.5-.5V114H96.5a.5.5,0,0,1,0-1H98v-1.5a.5.5,0,0,1,1,0V113h1.5a.5.5,0,0,1,0,1H99v1.5A.5.5,0,0,1,98.5,116Z"
                          transform="translate(-4 -2.1)"
                          fill="#FFD100"
                        ></path>
                        <path
                          d="M16.5,85a.5.5,0,0,1-.5-.5V83H14.5a.5.5,0,0,1,0-1H16V80.5a.5.5,0,0,1,1,0V82h1.5a.5.5,0,0,1,0,1H17v1.5A.5.5,0,0,1,16.5,85Z"
                          transform="translate(-4 -2.1)"
                          fill="#FFD100"
                        ></path>
                        <path
                          d="M7,13a3,3,0,1,1,3-3A3,3,0,0,1,7,13ZM7,8a2,2,0,1,0,2,2A2,2,0,0,0,7,8Z"
                          transform="translate(-4 -2.1)"
                          fill="#FFD100"
                        ></path>
                        <path
                          d="M113.5,71a4.5,4.5,0,1,1,4.5-4.5A4.51,4.51,0,0,1,113.5,71Zm0-8a3.5,3.5,0,1,0,3.5,3.5A3.5,3.5,0,0,0,113.5,63Z"
                          transform="translate(-4 -2.1)"
                          fill="#FFD100"
                        ></path>
                        <path
                          d="M107.66,7.05A5.66,5.66,0,0,0,103.57,3,47.45,47.45,0,0,0,85.48,3h0A5.66,5.66,0,0,0,81.4,7.06a47.51,47.51,0,0,0,0,18.1,5.67,5.67,0,0,0,4.08,4.07,47.57,47.57,0,0,0,9,.87,47.78,47.78,0,0,0,9.06-.87,5.66,5.66,0,0,0,4.08-4.09A47.45,47.45,0,0,0,107.66,7.05Z"
                          transform="translate(-4 -2.1)"
                          fill="#2ec98a"
                        ></path>
                        <path
                          d="M100.66,12.81l-1.35,1.47c-1.9,2.06-3.88,4.21-5.77,6.3a1.29,1.29,0,0,1-1,.42h0a1.27,1.27,0,0,1-1-.42c-1.09-1.2-2.19-2.39-3.28-3.56a1.29,1.29,0,0,1,1.88-1.76c.78.84,1.57,1.68,2.35,2.54,1.6-1.76,3.25-3.55,4.83-5.27l1.35-1.46a1.29,1.29,0,0,1,1.9,1.74Z"
                          transform="translate(-4 -2.1)"
                          fill="#fff"
                        ></path>
                      </svg>
                    </div>
                    <BlockContent>
                      <BlockHeadContent>
                        <h4>Verify Your Ghana Card Details</h4>
                        {/* <span className="sub-text sub-text-sm text-soft">3 minutes</span> */}
                      </BlockHeadContent>
                      <p>Please grant access to your camera before proceeding. Ensure that there is enough light for a clear image capture.</p>


                      {/* <ul className="list list-sm list-checked">
                        <li>
                        Performing fund transfer
                        </li>
                        <li>
                        Purchasing mobile airtime and internet bundles
                        </li>
                        <li>Receive and send payment with CALPAY Wallet</li>
                      </ul> */}
                      <Form noValidate onSubmit={handleSubmit(onFormSubmit)}>
                        <Row className="g-4">
                          <Col lg="12">
                            {hide && <FormGroup className="form-group">
                              <div className="webcam-container">
                                <div
                                  className="webcam-img"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    capture();
                                  }}
                                >
                                  {image == "" ? (
                                    <Webcam
                                      className="webcam"
                                      audio={false}
                                      height={200}
                                      ref={webcamRef}
                                      screenshotFormat="image/jpeg"
                                      width={600}
                                      videoConstraints={videoConstraints}
                                      forceScreenshotSourceSize={true}
                                      imageSmoothing={true}
                                      screenshotQuality={1}
                                    />
                                  ) : (
                                    <div className="user-card">
                                      <UserAvatar image={image} theme="warning" className="xl sq"></UserAvatar>
                                      <div className="user-info">
                                        <span className="sub-text">
                                          {image != "" ? (
                                         ''
                                          ) : (
                                            <Button
                                              onClick={(e) => {
                                                e.preventDefault();
                                                capture();
                                              }}
                                              color="white"
                                              outline
                                              className="btn-outline-warning btn-dim"
                                            >
                                              Capture Selfie
                                            </Button>
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  {image == "" ? (
                                    <OverlineTitle>
                                      Tap on Picture to Capture <Icon name="camera-fill"></Icon>
                                    </OverlineTitle>
                                  ) : (
                                    ""
                                  )}
                                </div>
                              </div>
                            </FormGroup>}
                            {/* if image show retake button, else show long button to disable camerea */}
                            {image != "" ? (  <Row className="g-4">
                            <Col lg="6">
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setImage("");
                                  }}
                                  color="white"
                                  outline
                                  className=" btn-block btn-outline-warning btn-dim"
                                >

                                  Retake Selfie
                                </Button>
                              </Col>
                              <Col lg="6">
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    Enabled()
                                  }}
                                  color="white"
                                  outline
                                  className="btn-block btn-outline-warning btn-dim"
                                >

                                  {hide ? "  Click here to Disable Camera" : "Click here to Enable Camera"}
                                </Button>
                              </Col>
                             
                            </Row>):( <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    Enabled()
                                  }}
                                  color="white"
                                  outline
                                  className="btn-block btn-outline-warning btn-dim"
                                >

                                  {hide ? "  Click here to Disable Camera" : "Click here to Enable Camera"}
                                </Button>)}
                          



                            {/* <WebcamCapture/> */}
                            <FormGroup className="form-group">
                              <label className="form-label" htmlFor="full-name-1">
                                Enter  Ghana Card Number GHA-XXXXXXXX-X
                              </label>
                              <div className="form-control-wrap">
                                <input
                                  className="form-control"
                                  type="text"
                                  name="ghcardnumber"
                                  onChange={(e) => setGhCardNumber(e.target.value)}
                                  placeholder="GHA-XXXXXXXX-X"
                                  ref={register({ required: "This field is required" })}
                                />
                                {errors.ghcardnumber && <span className="invalid">{errors.ghcardnumber.message}</span>}
                              </div>
                            </FormGroup>
                          </Col>

                          <Col lg="6">
                            <div className="nk-kycfm-upload">
                              <h6 className="title nk-kycfm-upload-title">Upload Front Image Copy Of Your Ghana Card</h6>

                              <Col sm="10">
                                <div className="nk-kycfm-upload-box">
                                  <Dropzone onDrop={(acceptedFiles, rejectFiles) => handleDropChange(acceptedFiles, 1, rejectFiles)} maxSize={10000000} accept="image/jpg, image/jpeg, image/png">
                                    {({ getRootProps, getInputProps }) => (
                                      <section>
                                        <div {...getRootProps()} className="dropzone upload-zone dz-clickable">
                                          <input {...getInputProps()} />
                                          {files.length === 0 && (
                                            <div className="dz-message">
                                              <span className="dz-message-text">Drag and drop file</span>
                                              <span className="dz-message-or">or</span>
                                              <span className="dz-message-text">Tap to Upload file</span>
                                              <span className="dz-message-text">(Accept 10mb image/png or jpeg)</span>
                                            </div>
                                          )}
                                          {files.map((file) => (
                                            <div
                                              key={file.name}
                                              className="dz-preview dz-processing dz-image-preview dz-error dz-complete"
                                            >
                                              <div className="dz-image">
                                                <img src={file.preview} alt="preview" />
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </section>
                                    )}
                                  </Dropzone>
                                </div>
                              </Col>
                              {/* <Col sm="6" className="d-none d-sm-block">
                          <div className="mx-md-4">
                            <img src={DocumentUpload1} alt="ID Front" />
                          </div>
                        </Col> */}
                            </div>
                          </Col>
                          <Col lg="6">
                            <div className="nk-kycfm-upload">
                              <h6 className="title nk-kycfm-upload-title">Upload Back Image Copy Of Your Ghana Card</h6>

                              <Col sm="10">
                                <div className="nk-kycfm-upload-box">
                                  <Dropzone onDrop={(acceptedFiles, rejectFiles) => handleDropChange(acceptedFiles, 2, rejectFiles)} maxSize={10000000} accept="image/jpg, image/jpeg, image/png">
                                    {({ getRootProps, getInputProps }) => (
                                      <section>
                                        <div {...getRootProps()} className="dropzone upload-zone dz-clickable">
                                          <input {...getInputProps()} />
                                          {files2.length === 0 && (
                                            <div className="dz-message">
                                              <span className="dz-message-text">Drag and drop file</span>
                                              <span className="dz-message-or">or</span>
                                              <span className="dz-message-text">Tap to Upload file</span>
                                              <span className="dz-message-text">(Accept 10mb image/png or jpeg)</span>
                                              {/* <Button color="primary" typ>SELECT</Button> */}
                                            </div>
                                          )}
                                          {files2.map((file) => (
                                            <div
                                              key={file.name}
                                              className="dz-preview dz-processing dz-image-preview dz-error dz-complete"
                                            >
                                              <div className="dz-image">
                                                <img src={file.preview} alt="preview" />
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </section>
                                    )}
                                  </Dropzone>
                                </div>
                              </Col>
                            </div>
                          </Col><Col xl="12">
                            <BlockContent className="flex-shrink-0">
                              {/* {verifyloading ? <Spinner size="sm" color="yellow" m /> : <Button color="white" size="lg" className="btn-block  btn-outline-warning btn-dim"   outline type="submit">Verify
                     </Button>} */}
                              <Button
                                size="lg"
                                className="btn-block  btn-warning"
                                type="submit"
                                disabled={verifyloading}
                                color="warning"
                              >
                                {verifyloading ? <Spinner size="sm" color="light" /> : "Verify"}
                              </Button>
                            </BlockContent>
                          </Col>
                        </Row>
                      </Form>
                      {/* <Button size="lg" color="warning">
                        Get Started
                      </Button> */}
                    </BlockContent>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Block>

        {/* <Block>
          <PreviewAltCard className="card-bordered" bodyClass="card-inner-lg">
            <div className="align-center flex-wrap flex-md-nowrap g-4">
              <BlockImage classNames="w-120px flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 118">
                  <path
                    d="M8.916,94.745C-.318,79.153-2.164,58.569,2.382,40.578,7.155,21.69,19.045,9.451,35.162,4.32,46.609.676,58.716.331,70.456,1.845,84.683,3.68,99.57,8.694,108.892,21.408c10.03,13.679,12.071,34.71,10.747,52.054-1.173,15.359-7.441,27.489-19.231,34.494-10.689,6.351-22.92,8.733-34.715,10.331-16.181,2.192-34.195-.336-47.6-12.281A47.243,47.243,0,0,1,8.916,94.745Z"
                    transform="translate(0 -1)"
                    fill="#ed8b00"
                  ></path>
                  <rect x="18" y="32" width="84" height="50" rx="4" ry="4" fill="#fff"></rect>
                  <rect x="26" y="44" width="20" height="12" rx="1" ry="1" fill="#e5effe"></rect>
                  <rect x="50" y="44" width="20" height="12" rx="1" ry="1" fill="#e5effe"></rect>
                  <rect x="74" y="44" width="20" height="12" rx="1" ry="1" fill="#e5effe"></rect>
                  <rect x="38" y="60" width="20" height="12" rx="1" ry="1" fill="#e5effe"></rect>
                  <rect x="62" y="60" width="20" height="12" rx="1" ry="1" fill="#e5effe"></rect>
                  <path
                    d="M98,32H22a5.006,5.006,0,0,0-5,5V79a5.006,5.006,0,0,0,5,5H52v8H45a2,2,0,0,0-2,2v4a2,2,0,0,0,2,2H73a2,2,0,0,0,2-2V94a2,2,0,0,0-2-2H66V84H98a5.006,5.006,0,0,0,5-5V37A5.006,5.006,0,0,0,98,32ZM73,94v4H45V94Zm-9-2H54V84H64Zm37-13a3,3,0,0,1-3,3H22a3,3,0,0,1-3-3V37a3,3,0,0,1,3-3H98a3,3,0,0,1,3,3Z"
                    transform="translate(0 -1)"
                    fill="#ffd100"
                  ></path>
                  <path
                    d="M61.444,41H40.111L33,48.143V19.7A3.632,3.632,0,0,1,36.556,16H61.444A3.632,3.632,0,0,1,65,19.7V37.3A3.632,3.632,0,0,1,61.444,41Z"
                    transform="translate(0 -1)"
                    fill="#ffd100"
                  ></path>
                  <path
                    d="M61.444,41H40.111L33,48.143V19.7A3.632,3.632,0,0,1,36.556,16H61.444A3.632,3.632,0,0,1,65,19.7V37.3A3.632,3.632,0,0,1,61.444,41Z"
                    transform="translate(0 -1)"
                    fill="none"
                    stroke="#ffd100"
                    strokeMiterlimit="10"
                    strokeWidth="2"
                  ></path>
                  <line
                    x1="40"
                    y1="22"
                    x2="57"
                    y2="22"
                    fill="none"
                    stroke="#fffffe"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></line>
                  <line
                    x1="40"
                    y1="27"
                    x2="57"
                    y2="27"
                    fill="none"
                    stroke="#fffffe"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></line>
                  <line
                    x1="40"
                    y1="32"
                    x2="50"
                    y2="32"
                    fill="none"
                    stroke="#fffffe"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></line>
                  <line
                    x1="30.5"
                    y1="87.5"
                    x2="30.5"
                    y2="91.5"
                    fill="none"
                    stroke="#FFD100"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></line>
                  <line
                    x1="28.5"
                    y1="89.5"
                    x2="32.5"
                    y2="89.5"
                    fill="none"
                    stroke="#9cabff"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></line>
                  <line
                    x1="79.5"
                    y1="22.5"
                    x2="79.5"
                    y2="26.5"
                    fill="none"
                    stroke="#9cabff"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></line>
                  <line
                    x1="77.5"
                    y1="24.5"
                    x2="81.5"
                    y2="24.5"
                    fill="none"
                    stroke="#9cabff"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></line>
                  <circle cx="90.5" cy="97.5" r="3" fill="none" stroke="#9cabff" strokeMiterlimit="10"></circle>
                  <circle cx="24" cy="23" r="2.5" fill="none" stroke="#9cabff" strokeMiterlimit="10"></circle>
                </svg>
              </BlockImage>
              <BlockContent>
                <BlockHeadContent className="px-lg-4">
                  <h5>We’re here to help you!</h5>
                  <p className="text-soft">
                    Ask a question or file a support ticket, manage request, report an issues. Our team support team
                    will get back to you by email.
                  </p>
                </BlockHeadContent>
              </BlockContent>
              <BlockContent className="flex-shrink-0">
                <Button size="lg" outline color="warning">
                  Get Support Now
                </Button>
              </BlockContent>
            </div>
          </PreviewAltCard>
        </Block> */}
      </Content>
    </React.Fragment>
  );
};

export default Welcome;
