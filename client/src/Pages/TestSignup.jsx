import React from "react";
import { useState } from "react";
//import Validation from "../Validation/Testvalidation";
import axios from "axios";

function TestSignup() {
  const [values, setValues] = useState({
    username: "",
    password: "",
  });

 function Validation(values){
    let errors = {};
    if(values.username === ""){
        errors.username = "Username is required";
    }

    if(values.password === ""){
        errors.password = "Password is required";
    } else if(values.password.length < 6){
        errors.password = "Password must be at least 6 characters";
    }
    
    return errors;
}

  const [errors, setErrors] = useState({});
  const handleInput = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

 const handleSubmit = (event) => {
  event.preventDefault();
  const validationErrors = Validation(values);
  setErrors(validationErrors);
  console.log(values);
  if (Object.keys(validationErrors).length === 0) {
    axios
      .post('http://localhost:3001/test', values)
      .then((res) => {
        console.log(res);
        console.log(values);
      })
      .catch((err) => {
        console.log(err);
      });
  }
};


  return (
    <div className="flex justify-center items-center w-screen h-screen">
      <div className="flex flex-col w-1/3 justify-center items-center h-3/4 bg-slate-500">
        <div className="flex p-2 w-full justify-center">
          <input
            type="text"
            placeholder="Username"
            className="w-3/4 p-2 rounded-lg"
            name="username"
            value={values.username}
            onChange={handleInput}
          />
          {errors.username && <p className="text-red-500">{errors.username}</p>}
        </div>
        <div className="flex p-2 w-full justify-center">
          <input
            type="text"
            placeholder="Password"
            className="w-3/4 p-2 rounded-lg"
            name="password"
            value={values.password}
            onChange={handleInput}
          />
          {errors.password && <p className="text-red-500">{errors.password}</p>}
        </div>

        <button className="bg-green-500 p-2 w-1/4 rounded-lg hover:bg-green-600 active:bg-green-900" onClick={handleSubmit}>
          Sign up
        </button>
      </div>
    </div>
  );
}

export default TestSignup;
