import React from "react";

import {
    Modal,
} from "blueprint-react";

function About(props) {

  const {
    show,
    onClose,
  } = props;

  return (
    <Modal className="about modal-container"
    title=" "
      isOpen={show}
      onClose={onClose}
      cancelButtonLabel={null} // prevent cancel button from being added to footer.
      applyButtonLabel={null} // prevent OK button from being added to footer.
      >
      <div className="header-bar__logo dbl-padding"><span className="icon-cisco icon-large"></span></div>
      <h1 data-test="serialNumber-Label">Nexus Dashboard Connector for Terraform</h1>
      <h6 className="dbl-padding">Version ##.#(#)</h6>
      <h6>© 2022 Cisco Systems, Inc. All rights reserved.</h6>
    </Modal>
  )
}

export default About;
