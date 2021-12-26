/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable max-len */
import React, {
  forwardRef, LegacyRef, ReactElement,
} from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import DatePicker from 'react-datepicker';
import { ImageListType } from 'react-images-uploading';
import {
  Button, Dropdown, Loader, Modal, TextBox,
} from '../../../components';
import { ReactComponent as Userphoto } from '../../../assets/userphoto.svg';
import { ReactComponent as Save } from '../../../assets/save.svg';
import Imageupload from '../../../components/imageupload';
import colors from '../../../components/global/themes/colors';
import { ThemeContext } from '../../../components/global/context/ThemeProvider';
import { getAllTreatment } from '../../treatment/api/apiFunctions';
import { getAllMed } from '../../medication/api/apiFunctions';
import 'react-datepicker/dist/react-datepicker.css';
import useForm from '../../../hooks/useForm';
import { createPatient, IUploadPatient, updatePatient } from '../api/apiFunctions';
import { url } from '../../../helpers/api/backend';

interface ICreateModal {
  modal: boolean
  setModal: React.Dispatch<React.SetStateAction<boolean>>
  patientdata?: {
    id: string
    folderId: string
    reg: string
    name: string
    phone: string
    age: string
    address: string
    total: number
    date: string
    takenTreatment: {id: string, tname: string, cost: number}[]
    medicine: {id: string, mname: string, munit: number, cost: number, stock: string}[]
    medCount: number[]
    images: string[]
  }
}
function CreateModal({ modal, setModal, patientdata }:ICreateModal):ReactElement {
  const { theme } = React.useContext(ThemeContext);
  const [patient, setPatient] = React.useState({
    reg: '',
    name: '',
    phone: '',
    age: '',
    address: '',
  });
  const [form, updateForm] = useForm(patient);
  const [valid, setValid] = React.useState(false);

  const alltreatment = useQuery('treatment', getAllTreatment);
  const [startDate, setStartDate] = React.useState<Date | [Date | null, Date | null] | null>(new Date());
  const allmed = useQuery('medicine', getAllMed);
  const [treatmentlist, setTreatmentlist] = React.useState<
  {id: string; label: string; checked: boolean, charge: string} []
  >();
  // eslint-disable-next-line max-len
  const [chosenTreatment, setChosenTreatment] = React.useState<{id: string;tname: string; tcharge: string}[]>([]);
  const [medlist, setMedlist] = React.useState<{
    id: string; label: string; checked: boolean, price: string; count:number; stock: string;
  }[]>();
  const [chosenMed, setChosenMed] = React.useState<{
    id: string; mname: string; price: string; count: number; stock: string, max: number
  }[]>([]);

  const [totalCost, setTotalCost] = React.useState(0);

  const [images, setImages] = React.useState<ImageListType>([]);

  const fetchedTreatment = React.useRef(false);
  const fetchedMed = React.useRef(false);

  React.useEffect(() => {
    if (!Object.values(form).includes('') && chosenTreatment.length > 0) {
      setValid(true);
    }
  }, [chosenTreatment.length, form]);

  React.useEffect(() => {
    const totalTreatmentCost = chosenTreatment.reduce((prev, cur) => prev + Number(cur.tcharge), 0);
    const totalMedCost = chosenMed.reduce((prev, cur) => prev + (Number(cur.price) * Number(cur.count)), 0);
    setTotalCost(totalTreatmentCost + totalMedCost);
  }, [chosenMed, chosenTreatment]);

  React.useEffect(() => {
    if (alltreatment.data && !fetchedTreatment.current) {
      fetchedTreatment.current = true;
      setTreatmentlist(alltreatment.data.map((t) => ({
        id: t.id, label: t.name, checked: false, charge: t.charge,
      })));
    }
  }, [alltreatment.data]);

  React.useEffect(() => {
    if (allmed.data && !fetchedMed.current) {
      fetchedMed.current = true;
      setMedlist(allmed.data.map((t) => ({
        id: t.id, label: t.name, checked: false, price: t.price, count: 0, stock: t.stock, max: +t.stock,
      })));
    }
  }, [allmed.data]);

  const setTreat = (id: string, action: boolean):void => {
    setTreatmentlist(treatmentlist?.map((l) => {
      // eslint-disable-next-line no-param-reassign
      if (l.id === id) l.checked = action;

      return l;
    }));
    const toTakeAction = alltreatment.data?.find((e) => e.id === id);
    if (action && toTakeAction) {
      // add treatment
      setChosenTreatment([...chosenTreatment,
        {
          id: toTakeAction.id,
          tname: toTakeAction.name,
          tcharge: toTakeAction.charge,
        },
      ]);
    } else if (!action && toTakeAction) {
      // remove treatment
      setChosenTreatment(chosenTreatment.filter((e) => e.id !== toTakeAction.id));
    }
  };

  const setMed = (id: string, action: boolean):void => {
    setMedlist(medlist?.map((l) => {
      // eslint-disable-next-line no-param-reassign
      if (l.id === id) l.checked = action;

      return l;
    }));
    const toTakeAction = allmed.data?.find((e) => e.id === id);
    if (action && toTakeAction) {
      // add treatment
      setChosenMed([...chosenMed,
        {
          id: toTakeAction.id,
          mname: toTakeAction.name,
          count: 1,
          price: toTakeAction.price,
          stock: toTakeAction.stock,
          max: +toTakeAction.stock,
        },
      ]);
    } else if (!action && toTakeAction) {
      // remove treatment
      setChosenMed(chosenMed.filter((e) => e.id !== toTakeAction.id));
    }
  };

  const setMedCount = (count: number, id: string):void => {
    setChosenMed(chosenMed.map((e) => {
      if (e.id === id) {
        e.count = count;
      }
      return e;
    }));
  };
  const DateInput:React.ReactNode = forwardRef(({ value, onClick }:{value: Date, onClick: ()=>void}, ref:LegacyRef<HTMLButtonElement> | undefined) => (
    <button
      type="button"
      style={{
        marginTop: '3px',
        height: '28px',
        border: 'none',
        padding: '5px 10px 5px 10px',
        borderRadius: '5px',
      }}
      onClick={onClick}
      ref={ref}
    >
      {value}
    </button>
  ));

  const queryClient = useQueryClient();
  const saveP = useMutation((data:IUploadPatient) => createPatient(data), {
    onSuccess: () => {
      queryClient.invalidateQueries('patients');
      setModal(false);
    },
  });
  const updateP = useMutation((data:IUploadPatient) => updatePatient(data), {
    onSuccess: () => {
      queryClient.refetchQueries('patients');
      setModal(false);
    },
  });
  const uploadData = (type:string):void => {
    const toUpload = {
      name: '', phone: '', age: '', address: '', regNum: '', treatments: '', total: 0, medicine: '', images: '', date: startDate, oldTotal: 0, folderId: '', id: '',
    };
    toUpload.name = form.name;
    toUpload.phone = form.phone;
    toUpload.age = form.age;
    toUpload.address = form.address;
    toUpload.regNum = form.reg;
    toUpload.treatments = JSON.stringify(chosenTreatment.map((e) => e.id));
    toUpload.medicine = JSON.stringify(chosenMed.map((e) => ({ id: e.id, count: e.count })));
    toUpload.total = totalCost;
    toUpload.date = startDate;
    toUpload.images = JSON.stringify(images);

    if (type === 'create') { saveP.mutate(toUpload); } else if (patientdata?.name) {
      toUpload.oldTotal = patientdata.total;
      toUpload.folderId = patientdata.folderId;
      toUpload.oldStock = atient.medicine.map((ee, index) => ({
        // eslint-disable-next-line no-underscore-dangle
          id: ee._id,
          mname: ee.name,
          munit: patient.medCount[index],
          cost: +ee.price,
          stock: ee.stock,
        })),;
      toUpload.id = patientdata.id;
      updateP.mutate(toUpload);
    }
  };
  React.useEffect(() => {
    if (patientdata?.name) {
      setPatient({
        reg: patientdata.reg,
        name: patientdata.name,
        phone: patientdata.phone,
        age: patientdata.age,
        address: patientdata.address,
      });
      setStartDate(new Date(patientdata.date));
      const chosenTreatmentIds:string[] = [];
      setChosenTreatment(patientdata.takenTreatment.map((e) => {
        chosenTreatmentIds.push(e.id);
        return {
          id: e.id,
          tname: e.tname,
          tcharge: e.cost.toString(),
        };
      }));

      if (alltreatment.data) {
        setTreatmentlist(alltreatment.data.map((t) => ({
          id: t.id, label: t.name, checked: chosenTreatmentIds.includes(t.id), charge: t.charge,
        })));
      }
      const medIds: string[] = [];
      setChosenMed(patientdata.medicine.map((e) => {
        medIds.push(e.id);
        return {
          id: e.id,
          mname: e.mname,
          price: e.cost.toString(),
          count: e.munit,
          stock: e.stock,
          max: +e.stock + +e.munit,
        };
      }));
      if (allmed.data) {
        setMedlist(allmed.data.map((t) => ({
          id: t.id, label: t.name, checked: medIds.includes(t.id), price: t.price, count: 0, stock: t.stock, max: +t.stock,
        })));
      }
      setImages(patientdata.images.map((e) => ({ dataURL: `${url}/patients/images/${e}` })));
    }
  }, [patientdata, alltreatment.data, allmed.data]);
  return (
    <div>
      {
      modal
      && (
      <Modal
        width={1100}
        header="Create a patient"
        closeModal={() => { setModal(false); }}
      >
        {
          saveP.isLoading || updateP.isLoading
            ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '100px',
              }}
              >
                <Loader />
                <br />
                <span>Saving Patient Data...</span>
              </div>
            )
            : (
              <div id="create-patient-body">
                <div id="patient-cost">
                  <div id="user-info">
                    <Userphoto />
                    <div id="total-cost">
                      Total Cost
                    </div>
                    <div id="cost">
                      {totalCost}
                      {' '}
                      MMK
                    </div>
                  </div>
                </div>
                <div id="patient-form">
                  <div id="patient-name" className="text-form">
                    <TextBox
                      label="Name"
                      width={212}
                      onInput={(text: string) => { updateForm('name', text); }}
                      value={form.name}
                    />
                  </div>

                  <div id="patient-phone" className="text-form">
                    <TextBox
                      label="Phone Number"
                      width={212}
                      onInput={(text: string) => { updateForm('phone', text); }}
                      value={form.phone}
                    />
                  </div>
                  <div id="patient-age" className="text-form">
                    <TextBox
                      label="Age"
                      onInput={(text: string) => { updateForm('age', text); }}
                      value={form.age}
                    />
                  </div>
                  <div style={{ width: '100%' }}>
                    <div id="patient-address" className="text-form">
                      <TextBox
                        label="Address"
                        width={541}
                        onInput={(text: string) => { updateForm('address', text); }}
                        value={form.address}
                      />
                    </div>
                  </div>
                  <div style={{ width: '100%', display: 'flex' }}>
                    <div id="patient-reg" className="text-form">
                      <TextBox
                        label="Registration Number"
                        width={212}
                        onInput={(text: string) => { updateForm('reg', text); }}
                        value={form.reg}
                      />
                    </div>
                    <div
                      className="label"
                      style={{ marginLeft: '10px' }}
                    >
                      Date
                      {' '}
                      <br />
                      <DatePicker
                  // @ts-ignore
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                  // @ts-ignore
                        customInput={<DateInput />}
                      />
                    </div>
                  </div>
                  <div id="treatment-area" style={{ width: '100%' }}>
                    <div id="treatment-type">
                      <div className="label">
                        Treatment Type
                      </div>
                      {
                  treatmentlist
                && (
                <Dropdown
                  label="Choose Treatment"
                  list={treatmentlist}
                  width={400}
                  setAction={setTreat}
                />
                )
                }
                    </div>
                    <div className="chosen-treatment">
                      <div className="label" style={{ textDecoration: 'underline' }}>
                        Chosen Treatment and Cost
                      </div>
                      <div className="treatments">
                        {
                  chosenTreatment.length > 0
                  && (
                    chosenTreatment.map((c) => (
                      <div
                        className="atreatment"
                        style={{
                          position: 'relative',
                          paddingRight: '20px',
                        }}
                      >
                        <span
                          className="treatment-name"
                          style={{
                            display: 'inline-block',
                            minWidth: '150px',
                          }}
                        >
                          {c.tname}

                        </span>
                        <span className="treatment-cost">
                          {c.tcharge}
                          {' '}
                          MMK
                        </span>
                        <span
                          aria-hidden="true"
                          onClick={() => {
                            setTreat(c.id, false);
                          }}
                          style={{
                            position: 'absolute',
                            right: '0',
                            top: '-1px',
                          }}
                        >
                          x

                        </span>
                      </div>

                    ))
                  )
                }
                      </div>
                    </div>
                  </div>
                  {/*  */}
                  <div id="med-area" style={{ width: '100%' }}>
                    <div id="med-type">
                      <div className="label">
                        Medication
                      </div>
                      {medlist
                && (
                <Dropdown
                  label="Choose Medication"
                  list={medlist}
                  width={400}
                  setAction={setMed}
                />
                )}
                    </div>
                    <div className="chosen-med">
                      <div className="label" style={{ textDecoration: 'underline' }}>
                        Chosen Medication and Cost
                      </div>
                      <div className="meds">
                        {
                    chosenMed.map((e) => (
                      <div
                        className="amed"
                        style={{
                          position: 'relative',
                          paddingRight: '20px',
                        }}
                      >
                        <span
                          className="med-name"
                          style={{
                            display: 'inline-block',
                            minWidth: '100px',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {e.mname}

                        </span>
                        <span
                          className="med-unit"
                          style={{
                            width: '300px',
                          }}
                        >
                          <input
                            type="number"
                            min={1}
                            max={e.max}
                            value={e.count}
                            className="med-unit-count"
                            onChange={(evt) => {
                              setMedCount(+evt.target.value, e.id);
                            }}
                            style={{
                              backgroundColor: colors.inputback[theme],
                              color: colors.text[theme],
                            }}
                          />
                        </span>
                        <span className="med-cost">
                          {+e.price * e.count}
                          {' '}
                          MMK
                        </span>
                        <span
                          aria-hidden="true"
                          onClick={() => {
                            setMed(e.id, false);
                          }}
                          style={{
                            position: 'absolute',
                            right: '0',
                            top: '2px',
                          }}
                        >
                          x

                        </span>
                      </div>
                    ))
                  }

                      </div>
                    </div>
                  </div>
                  <div id="img-area" style={{ width: '100%' }}>
                    <div className="label">
                      Patient Images
                    </div>
                    <div>
                      <Imageupload
                        images={images}
                        setImages={setImages}
                      />
                    </div>
                    <div
                      style={{
                        height: '20px',
                      }}
                    />
                    <Button
                      onClick={() => {
                        if (valid) {
                          if (patientdata?.name) {
                            uploadData('edit');
                          } else {
                            uploadData('create');
                          }
                        }
                      }}
                      Icon={Save}
                      color1={valid ? '#53BB85' : '#757575'}
                      color2={valid ? '#53BB85' : '#969696'}
                      label="Save"
                    />
                  </div>
                </div>
              </div>
            )
}
      </Modal>
      )
    }
    </div>
  );
}

CreateModal.defaultProps = {
  patientdata: {

  },
};

export default CreateModal;
