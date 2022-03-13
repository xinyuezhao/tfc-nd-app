import React from "react";

import {
    Modal,
} from "blueprint-react";

function About(props) {
  const {
    show,
    version,
    onClose,
  } = props;

  return (
    <Modal className="about"
    title=" "
      isOpen={show}
      onClose={onClose}
      cancelButtonLabel={null} // prevent cancel button from being added to footer.
      applyButtonLabel={null} // prevent OK button from being added to footer.
      >
      <div className="header-bar__logo dbl-padding"><span className="icon-cisco icon-large"></span></div>
      <h2>Nexus Dashboard Connector for HashiCorp Terraform</h2>
      <h6 className="dbl-padding">Version {version}</h6>
      <h6>© 2022 Cisco Systems, Inc. All rights reserved.</h6>
    </Modal>
  )
}

export default About;
