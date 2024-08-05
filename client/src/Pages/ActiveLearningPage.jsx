import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Spinner,
  Label,
  TextInput,
  Select,
  Card,
} from "flowbite-react";
import DetectionResultTableAL from "../Components/ActiveLearning/DetectionResultTableAL";
import DoubleDatePicker from "../Components/DoubleDatePicker";
import DropdownCheckbox from "../Components/DropdownCheckbox";
import DropdownDoubleSlider from "../Components/DropdownDoubleSlider";
import { isAfter, isBefore, isSameDay } from "date-fns";
import { PiFarmFill } from "react-icons/pi";
import { GiCorn } from "react-icons/gi";
import { FaSearch } from "react-icons/fa";
import { MdOutlineCancel, MdModelTraining } from "react-icons/md";
import axios from "axios";

function ActiveLearningPage() {
  const [name, setName] = useState("");
  const [results, setResults] = useState([]);
  const [isLoadingResults, setIsLoadingResults] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState("");
  const [selectedModel, setSelectedModel] = useState(null);
  const [models, setModels] = useState([]);
  const [trainedData, setTrainedData] = useState([]);
  const [filter, setFilter] = useState({
    min_date: -1,
    max_date: new Date(),
    min_tassel_count: 0,
    max_tassel_count: 100,
    farm: {},
  });

  const max_tassel_count = results.reduce((acc, value) => {
    return (acc = acc > value.tassel_count ? acc : value.tassel_count);
  }, 100);

  const filterDateBool = (result) => {
    const splitted = result.record_date.split(" ");
    const splitted_date = splitted[0].split("-");
    const splitted_time = splitted[1].split(":");
    const date_obj = new Date(
      splitted_date[0],
      parseInt(splitted_date[1]) - 1,
      splitted_date[2],
      splitted_time[0],
      splitted_time[1],
      splitted_time[2]
    );
    const start_bool =
      filter.min_date == -1 ||
      isSameDay(date_obj, filter.min_date) ||
      isAfter(date_obj, filter.min_date);

    const end_bool =
      isSameDay(date_obj, filter.max_date) ||
      isBefore(date_obj, filter.max_date);

    return start_bool && end_bool;
  };

  const keyword_bool = (keyword, value) => {
    const splitted_val = value.split(" ");
    let flag = false;
    splitted_val.forEach((val) => {
      if (val.toLowerCase().trim().startsWith(keyword)) {
        flag = true;
        return;
      }
    });
    if (value.toLowerCase().trim().startsWith(keyword)) {
      return true;
    }

    return flag;
  };

  const searchFilter = () => {
    const filtered_list = [];
    results.forEach((result) => {
      // Filtering
      const date_bool = filterDateBool(result);
      const farm_bool = filter.farm[result.farm_name];
      const tassel_count_bool =
        filter.min_tassel_count <= result.tassel_count &&
        filter.max_tassel_count >= result.tassel_count;
      // Search keyword
      const keyword = search.toLowerCase().trim();

      const search_bool =
        keyword_bool(keyword, result.name) ||
        keyword_bool(keyword, result.farm_name) ||
        keyword_bool(keyword, result.farm_patch_name);

      if (date_bool && farm_bool && tassel_count_bool && search_bool) {
        filtered_list.push(result);
      }
    });

    return filtered_list;
  };

  const getSelectedData = () => {
    const selected_data = [];
    results.forEach((result) => {
      if (selected.has(`${result.farm_name}_${result.farm_patch_id}_${result.id}`)) {
        selected_data.push(result);
      }
    });
    return selected_data;
  };

  const handleSubmit = () => {
    if (name === "") {
      alert("Please enter a model name.");
      return;
    }

    if (getSelectedData().length < 5) {
      alert("Please select at least 5 data.");
      return;
    }

    const data = {
      list_of_data : getSelectedData(),
      model_name: name,
      base_model_id: selectedModel === "BASE" ? null : selectedModel,
    }

    axios
      .post("/api/detect/models/init_train", data)
      .then((res) => {
        if (res.status === 200) {
          alert("Training started successfully!");
          navigate("/user");
        } else {
          console.log(res.status);
          alert("Something went wrong!");
        }
      })
  };

  useEffect(() => {
    axios
      .get("/api/user/farm/query_all_farms_owned")
      .then((res) => {
        if (res.status === 200) {
          res.data.farms.forEach((farm) => {
            setFilter((prev) => ({
              ...prev,
              farm: {
                ...prev.farm,
                [farm.name]: true,
              },
            }));
          });
        } else {
          console.log(res.status);
          alert("Something went wrong!");
          navigate("/user");
        }
      })
      .catch((err) => {
        console.log(err);
        alert("Something went wrong!");
        navigate("/user");
      });

    axios
      .get("/api/storage/search_result_history")
      .then((res) => {
        if (res.status === 200) {
          setResults(res.data.result);
          const max_tc = res.data.result.reduce((acc, value) => {
            return (acc = acc > value.tassel_count ? acc : value.tassel_count);
          }, 100);
          setFilter((prev) => ({
            ...prev,
            max_tassel_count: max_tc,
          }));
        } else {
          console.log(res.status);
          alert("Something went wrong! Please Reload the page.");
        }
      })
      .catch((err) => {
        console.log(err);
        alert("Something went wrong! Please Reload the page.");
      })
      .then(() => setIsLoadingResults(false));
    
    axios
			.get("/api/detect/models/query_all_model_selection")
			.then((res) => {
				if (res.status == 200) {
					setModels([{ model_id: "BASE", name: "Base Model" }, ...res.data.models]);
					setIsLoading(false);
				} else {
					alert("Something went wrong.");
					window.location.reload();
				}
			})
			.catch((err) => {
				alert("Error occured: " + err);
				window.location.reload();
			});
  }, []);

  return (
    <>
      <Card className="my-6 mx-4 lg:my:10 lg:mx-16 shadow-lg border xl:mb-20 pb-5">
        <header className="flex flex-wrap flex-row gap-2 justify-between shadow-b border-b-2 pb-5 border-black">
					<h1 className="text-4xl font-extrabold">Active Learning</h1>
				</header>
          <div className="overflow-y-auto">
            <section className="flex lg:flex-row flex-col py-5 gap-4">
              <div className="flex flex-col gap-2 w-full lg:w-1/2">
                <Label value="Model Name" />
                <TextInput
                  placeholder="Enter Model Name"
                  className="w-full"
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 w-full lg:w-1/2">
                <Label value="Model" />
                <Select
                  // icon={PiFarmFill}
                  id="model_selection"
                  value={selectedModel}
                  className="shadow rounded-lg"
                  onChange={(ev) => setSelectedModel(ev.target.value)}
                >
                  {models.map((m) => (
                    <option key={m.model_id} value={m.model_id}>
                      {m.name}
                    </option>
                  ))}
                </Select>
              </div>
            </section>
            <header className="flex flex-wrap flex-row gap-2 justify-between shadow-b border-b-2 py-5 border-black">
              <h1 className="font-bold">Detection Results</h1>
            </header>
            <section className="flex flex-col xl:flex-row justify-between gap-4 py-5">
              <div className="flex flex-col md:flex-row justify-start gap-4">
                <DoubleDatePicker
                  filter={filter}
                  setFilter={setFilter}
                  min_date_key="min_date"
                  max_date_key="max_date"
                />
                <div className="flex flex-col sm:flex-row gap-4">
                  <DropdownCheckbox
                    filter={filter}
                    setFilter={setFilter}
                    label="Farm"
                    update_key="farm"
                    icon={<PiFarmFill size={20} className="text-gray-400" />}
                  />
                  <DropdownDoubleSlider
                    label={"Tassel Count"}
                    dropdown_label={"Tassel Count"}
                    filter={filter}
                    setFilter={setFilter}
                    min_update_key="min_tassel_count"
                    max_update_key="max_tassel_count"
                    upper_limit={max_tassel_count}
                    icon={<GiCorn size={20} className="text-gray-400" />}
                  />
                </div>
              </div>
              <div className="flex flex-col justify-end sm:w-1/2 sm:pr-2 xl:pr-0 xl:w-1/4 mt-2 sm:mt-0">
                <TextInput
                  id="Search"
                  placeholder="Search Detection Result"
                  icon={FaSearch}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </section>
            <section>
              <DetectionResultTableAL
                results={searchFilter()}
                selected={selected}
                setSelected={setSelected}
              />
            </section>
            <section className="flex flex-col sm:flex-row justify-center gap-5 mt-5 pt-5">
              <Button
                onClick={handleSubmit}
                type="submit"
                className="sm:w-1/2 bg-custom-green-2 hover:bg-custom-green-1 text-white ring-inset ring-custom-green-1"
              >
                <div className="flex flex-row justify-center items-center">
                  <MdModelTraining className="text-lg mr-1" />
                  Start Training
                </div>
              </Button>
            </section>
          </div>
      </Card>
    </>
  );
}
export default ActiveLearningPage;
