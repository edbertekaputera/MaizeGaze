import React, { useEffect, useState } from "react";
import { Modal, Table, Button, Spinner } from "flowbite-react";
import { IoLocationSharp, IoTrashOutline } from "react-icons/io5";
import { MdOutlineEdit } from "react-icons/md";
import { SlSizeActual } from "react-icons/sl";
import axios from "axios";
import { useLocation } from "react-router-dom";
import ConfirmationModal from "../ConfirmationModal";
import MessageModal from "../MessageModal";
import UpdateFarmModal from "./UpdateFarmModal";
import { set } from "date-fns";

function ViewFarmModal({ state, setState }) {
  const [farm, setFarm] = useState({});
  const [patches, setPatches] = useState([]);
  const [totalSize, setTotalSize] = useState(0);
  // const { name } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const name = query.get("name");

  const [messageModal, setMessageModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const handleDelete = () => {
    axios
      .delete("/api/user/farm/delete_tier", {
        data: {
          name: name,
        },
      })
      .then((res) => {
        if (res.data.status_code === 200) {
          alert("Farm deleted successfully");
        } else {
          alert("Failed to delete farm, please try again...");
          setShowRemoveModal(false);
          setMessageModal(true);
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Failed to delete farm, please try again...");
      });
  };

  useEffect(() => {
    // async function fetchData() {
    //    await axios
    // function fetchData() {
    setIsLoading(true);
    axios
      .get("/api/user/farm/query_farm", {
        params: {
          farm_name: name,
        },
      })
      .then((res) => {
        if (res.data.status_code !== 200) {
          const patchArray = Array.isArray(res.data.farm.patches)
            ? res.data.farm.patches
            : [];
          const totalSize = patchArray.reduce(
            (total, patch) => total + patch.land_size,
            0
          );
          setFarm(res.data.farm);
          setPatches(res.data.farm.patches);
          setTotalSize(totalSize);
          console.log(res);
        } else {
          alert(
            "Failed to load information for farm '${name}', please try again..."
          );
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Failed to fetch farm, please try again...");
      })
      .then(() => setIsLoading(false));
    // }
    // fetchData();
  }, [state]);

  return (
    <>
      {isLoading ? (
        <div className="flex flex-col justify-center mb-2 items-center">
          <h3 className="mb-5 text-xl font-normal text-gray-600">Loading...</h3>
          <Spinner size={"xl"} color={"success"} />
        </div>
      ) : (
        <>
          {/* Remove Farm Modal */}
          <MessageModal
            state={messageModal}
            setState={() => {
              setMessageModal(false);
              window.location.reload();
            }}
          >
            Successfully removed farm '{name}'.
          </MessageModal>
          <ConfirmationModal
            state={showRemoveModal}
            setState={setShowRemoveModal}
            action={handleDelete}
          >
            <span className="w-5/6 mx-auto">
              Are you sure you want to delete these farms?
            </span>
            <div className="mb-6 mx-auto my-4 w-5/6 max-h-28 overflow-auto px-4 py-2 outline-1 outline-gray-400 outline rounded-lg shadow-lg drop-shadow-sm text-2xl font-medium text-gray-900 ">
              <ul>
                <li className="text-gray-600 text-sm">{name}</li>
              </ul>
            </div>
          </ConfirmationModal>

          {/* Edit Farm Modal */}
          <UpdateFarmModal
            state={showEditModal}
            setState={setShowEditModal}
            // name={name}
            farm={farm}
          ></UpdateFarmModal>

          <Modal show={state} size="4xl" onClose={() => setState(null)} popup>
            <div className="rounded shadow-md overflow-y-auto">
              <Modal.Header></Modal.Header>
              <Modal.Body>
                <div className="p-5">
                  <header className="text-2xl font-bold">{farm.name}</header>
                  <div className="flex w-full items-center">
                    <div className="w-2/3 py-5">
                      <div className="flex items-center">
                        <IoLocationSharp size={20} />
                        <span className="ml-2">
                          {farm.country}, {farm.city}
                        </span>
                      </div>
                      <div className="flex items-center mt-2">
                        <span className="text-gray-500">
                          <i>{farm.address}</i>
                        </span>
                      </div>
                    </div>
                    <div className="w-1/3">
                      <div className="flex items-center justify-end">
                        <SlSizeActual size={25} />
                        <div className="ml-2 text-xl font-bold">
                          {totalSize} <span className="text-xs"> mu </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex text-justify">
                    <p>{farm.description}</p>
                  </div>
                  <div className="items-center mt-10">
                    <Table>
                      <Table.Head>
                        <Table.HeadCell className="bg-custom-brown-1 text-white">
                          Patch Name
                        </Table.HeadCell>
                        <Table.HeadCell className="bg-custom-brown-1 text-white">
                          Size
                        </Table.HeadCell>
                      </Table.Head>
                      <Table.Body className="divide-y">
                        {patches.length > 0 ? (
                          patches.map((patch, index) => (
                            <Table.Row key={index} className="bg-white">
                              <Table.Cell>{patch.name}</Table.Cell>
                              <Table.Cell>{patch.land_size}</Table.Cell>
                            </Table.Row>
                          ))
                        ) : (
                          <Table.Row className="bg-white">
                            <Table.Cell colSpan={2} className="text-center">
                              No patches available.
                            </Table.Cell>
                          </Table.Row>
                        )}
                      </Table.Body>
                    </Table>
                  </div>
                </div>
                <section className="flex justify-center gap-5 mt-5">
                  <Button
                    color="failure"
                    className="w-1/2 "
                    onClick={() => setShowRemoveModal(true)}
                  >
                    <div className="flex flex-row justify-center items-center">
                      <IoTrashOutline className="text-lg mr-1" />
                      Remove
                    </div>
                  </Button>
                  <Button
                    className="w-1/2 bg-yellow-500 hover:bg-yellow-600 text-white ring-inset ring-bg-yellow-500 hover:ring-bg-yellow-600"
                    onClick={() => setShowEditModal(true)}
                  >
                    <div className="flex flex-row justify-center items-center">
                      <MdOutlineEdit className="text-lg mr-1" />
                      Edit
                    </div>
                  </Button>
                </section>
              </Modal.Body>
            </div>
          </Modal>
        </>
      )}
    </>
  );
}

export default ViewFarmModal;
