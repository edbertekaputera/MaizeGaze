import React, { useState, useMemo, useEffect } from "react";
import {
  Modal,
  Button,
  Label,
  TextInput,
  Textarea,
  Dropdown,
} from "flowbite-react";
import Select from "react-select";
import MessageModal from "../MessageModal";
import { FaChevronDown } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { IoCreateOutline } from "react-icons/io5";
import { MdAddCircle, MdOutlineCancel } from "react-icons/md";
import axios from "axios";

function CreateFarmModal({ state, setState }) {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState({});
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const initialPatch = [
    {
      id: 1,
      name: "",
      land_size: 0,
      sizeUnit: "mu",
    },
  ];
  const [patches, setPatches] = useState(initialPatch);
  // const [sizeUnit, setSizeUnit] = useState("mu");
  const [messageModal, setMessageModal] = useState(false);

  const convertSize = (size, sizeUnit) => {
    if (isNaN(size) || size === null) {
        return 0;
    }

    switch (sizeUnit) {
        case "mu":
            return parseFloat((size * 1).toFixed(2));
        case "acre":
            return parseFloat((size * 6.07).toFixed(2));
        case "ha":
            return parseFloat((size * 15).toFixed(2));
        default:
            console.error("Invalid size unit");
            return 0;
    }
};   

  const getCountry = (selectedCountry) => {
    if (selectedCountry && selectedCountry.label) {
      const parts = selectedCountry.label.split(" ");
      return parts.slice(1).join(" ");
    }
    return null;
  };

  const handleAddPatch = () => {
    const newId = patches.length ? patches[patches.length - 1].id + 1 : 1;
    const newPatch = { id: newId, name: "", land_size: 0, sizeUnit: "mu" };
    setPatches([...patches, newPatch]);
  };

  const handleRemovePatch = (id) => {
    if (patches.length > 1) {
      setPatches(patches.filter((patch) => patch.id !== id));
    }
  };

  const handleInputChange = (id, field, value) => {
    setPatches(
      patches.map((patch) =>
        patch.id === id ? { ...patch, [field]: value } : patch
      )
    );
  };

  const onCloseModal = (x) => {
    setMessageModal(x);
    window.location.reload();
  };

  const handleCreate = () => {
    const farm = {
      name,
      country: getCountry(selectedCountry),
      city,
      address,
      description,
      patches: patches.map((patch) => ({
        name: patch.name,
        land_size: convertSize(patch.land_size, patch.sizeUnit),
      })),
    };
    axios
      .post("/api/user/farm/create_farm", farm)
      .then((res) => {
        if (res.data.status_code === 201) {
          setMessageModal(true);
        } else {
          alert(res.data.message);
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Failed to create farm, please try again...");
      });
  };

  useEffect(() => {
    fetch("https://valid.layercode.workers.dev/list/countries?format=select&flags=true&value=code")
    .then((response) => response.json())
    .then((data) => {
      setCountries(data.countries);
      setSelectedCountry(null);
    });
  }, []);

  return (
    <>
      <MessageModal
        state={messageModal}
        setState={onCloseModal}
      >{`Farm '${name}' has been successfully created.`}</MessageModal>
      <Modal show={state} size="4xl" onClose={() => setState(null)} popup>
        <div className="rounded shadow-md overflow-y-auto">
          <Modal.Header>
            <div className="pl-4 pt-4 text-2xl font-bold text-gray-900 dark:text-white">
              Create New Farm
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="flex flex-col justify-center">
              <form
                onSubmit={(ev) => {
                  ev.preventDefault();
                  if (
                    name.trim() != "" &&
                    getCountry(selectedCountry) != "" &&
                    city.trim() != "" &&
                    address.trim() != "" &&
                    description.trim() != "" &&
                    patches.length > 0
                  ) {
                    handleCreate();
                  } else {
                    alert("Incomplete data.");
                  }
                }}
              >
                <div className="mt-4 flex flex-col gap-y-5">
                  <section className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label value="Farm Name" />
                      <TextInput
                        required
                        color={"white"}
                        value={name}
                        className="rounded-lg"
                        placeholder="Name of the farm"
                        onChange={(event) => setName(event.target.value)}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-x-5 gap-4">
                      <div className="flex flex-col gap-2 sm:w-1/2">
                        <Label value="Country" />
                        <Select
                          required
                          options={countries}
                          value={selectedCountry}
                          placeholder="Select country"
                          className="rounded-lg"
                          onChange={(selectedOption) =>
                            setSelectedCountry(selectedOption)
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-2 sm:w-1/2">
                        <Label value="City" />
                        <TextInput
                          required
                          color={"white"}
                          value={city}
                          className="rounded-lg"
                          placeholder="City of the farm"
                          onChange={(event) => setCity(event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label value="Address" />
                      <Textarea
                        required
                        color={"white"}
                        value={address}
                        className="rounded-lg"
                        placeholder="Address of the farm"
                        onChange={(event) => setAddress(event.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label value="Description" />
                      <Textarea
                        required
                        color={"white"}
                        value={description}
                        className="rounded-lg h-32"
                        placeholder="Write a brief description of the farm..."
                        onChange={(event) => setDescription(event.target.value)}
                      />
                    </div>
                    <div className="flex flex-row items-center justify-between">
                      <header className="text-xl font-bold text-gray-900 dark:text-white">
                        PATCHES
                      </header>
                      <span className="text-sm">
                        Total size:{" "}
                        <span className="font-bold">
                          {patches.reduce(
                            (total, patch) =>
                              total +
                              convertSize(
                                parseFloat(patch.land_size),
                                patch.sizeUnit
                              ),
                            0
                          )}{" "}
                          mu
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {patches.map((patch) => (
                        <div
                          key={patch.id}
                          className="flex flex-col gap-2 pb-2"
                        >
                          <div className="flex flex-row items-center justify-between">
                            <span className="flex-wrap">
                              {`PATCH ${patch.id}`}
                            </span>
                            <span className="flex-grow border-t border-gray-300 mx-4"></span>
                            {patches.length > 1 && (
                              <Button
                                className="px-2"
                                color=""
                                onClick={() => handleRemovePatch(patch.id)}
                              >
                                <FiTrash2 size={25} />
                              </Button>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row gap-x-5 gap-4">
                            <div className="flex flex-col gap-2 sm:w-1/2">
                              <Label value="Patch Name" />
                              <TextInput
                                required
                                color={"white"}
                                value={patch.name}
                                className="rounded-lg"
                                placeholder="Name of the patch"
                                onChange={(event) =>
                                  handleInputChange(
                                    patch.id,
                                    "name",
                                    event.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="flex flex-col gap-2 sm:w-1/2">
                              <Label value="Patch Size" />
                              <div className="flex flex-row min-w-64">
                                <input
                                  required
                                  type="text"
                                  color={"white"}
                                  value={patch.land_size}
                                  className="w-8/12 rounded-lg rounded-r-none"
                                  placeholder="Size of the patch"
                                  onChange={(event) =>{
                                    const newSize = event.target.value;
                                    const numericValue = Number(newSize);
                                    if (!isNaN(numericValue) || newSize === '') {
                                        handleInputChange(
                                        patch.id,
                                        "land_size",
                                        numericValue
                                        )
                                    }
                                  }}
                                />
                                <Dropdown
                                  size=""
                                  className=""
                                  required
                                  label={patch.sizeUnit}
                                  onChange={(value) =>
                                    handleInputChange(
                                      patch.id,
                                      "sizeUnit",
                                      value
                                    )
                                  }
                                  renderTrigger={() => (
                                    <Button
                                      color="gray"
                                      className="w-4/12 border-gray-500 text-black rounded-lg rounded-l-none text-center"
                                    >
                                      {patch.sizeUnit}
                                      <FaChevronDown className="absolute right-2  h-5 w-5" />
                                    </Button>
                                  )}
                                >
                                  <Dropdown.Item
                                    onClick={() =>
                                      handleInputChange(
                                        patch.id,
                                        "sizeUnit",
                                        "mu"
                                      )
                                    }
                                  >
                                    mu
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() =>
                                      handleInputChange(
                                        patch.id,
                                        "sizeUnit",
                                        "acre"
                                      )
                                    }
                                  >
                                    acre
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() =>
                                      handleInputChange(
                                        patch.id,
                                        "sizeUnit",
                                        "ha"
                                      )
                                    }
                                  >
                                    ha
                                  </Dropdown.Item>
                                </Dropdown>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button
                        className="bg-custom-brown-1 text-white mt-5"
                        onClick={handleAddPatch}
                      >
                        <div className="flex flex-row justify-center items-center">
                          <MdAddCircle className="text-lg mr-1" />
                          Add Patch
                        </div>
                      </Button>
                    </div>
                  </section>
                  <section className="flex flex-col sm:flex-row justify-center gap-5 mt-5">
                    <Button
                      color="failure"
                      className="sm:w-1/2"
                      onClick={() => setState(false)}
                    >
                      <div className="flex flex-row justify-center items-center">
                        <MdOutlineCancel className="text-lg mr-1" />
                        Cancel
                      </div>
                    </Button>
                    <Button
                      type="submit"
                      className="sm:w-1/2 bg-custom-green-2 hover:bg-custom-green-1 text-white ring-inset ring-custom-green-1"
                    >
                      <div className="flex flex-row justify-center items-center">
                        <IoCreateOutline className="text-lg mr-1" />
                        Create
                      </div>
                    </Button>
                  </section>
                </div>
              </form>
            </div>
          </Modal.Body>
        </div>
      </Modal>
    </>
  );
}

export default CreateFarmModal;
