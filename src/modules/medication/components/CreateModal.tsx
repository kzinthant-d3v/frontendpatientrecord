import React, { ReactElement } from 'react';
import {
  Button, Dropdown, Modal, TextBox,
} from '../../../components';
import { ReactComponent as Save } from '../../../assets/save.svg';
import Imageupload from '../../../components/imageupload';
import colors from '../../../components/global/themes/colors';
import { ThemeContext } from '../../../components/global/context/ThemeProvider';
import Textbox from '../../../components/textbox';

interface ICreateModal {
  modal: boolean
  setModal: React.Dispatch<React.SetStateAction<boolean>>
}
function CreateModal({ modal, setModal }:ICreateModal):ReactElement {
  const { theme } = React.useContext(ThemeContext);
  return (
    <div>
      {
      modal
      && (
      <Modal
        width={700}
        header="Create Treatment"
        closeModal={() => { setModal(false); }}
      >
        <div id="create-medicine-body">
          <div>
            <Textbox
              label="Medicine Name"
              width={550}
            />
            <div
              style={{
                height: '10px',
              }}
            />
            <Textbox
              label="In Stock"
              width={80}
            />
            <div
              style={{
                height: '10px',
              }}
            />
            <Textbox
              label="Price per unit"
              width={120}
            />
            <div
              style={{
                height: '10px',
              }}
            />
            <Textbox
              label="Medicine Code"
              width={120}
            />
          </div>
          <div
            style={{
              marginTop: '30px',
            }}
          >
            <Button
              onClick={() => alert('save')}
              Icon={Save}
              color1="#53BB85"
              color2="#61F2A7"
              label="Save"
            />
          </div>
        </div>
      </Modal>
      )
    }
    </div>
  );
}

export default CreateModal;
