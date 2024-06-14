try {
  const formData = new FormData();
  formData.append("image", image);
  console.log("Data to send:", dataToSend);
  const response = await fetch(
    "http://localhost:3001/api/stock/addProduct",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    }
  );

  console.log("Response status:", response.status);

  if (!response.ok) {
    const errorData = await response.json();
    if (errorData.message === "Product already exists") {
      Swal.fire({
        icon: "error",
        title: "Product Addition Failed",
        text: "Product already exists.",
        customClass: {
          popup: "z-50", // Apply Tailwind CSS class to adjust z-index
        },
        didOpen: () => {
          document.querySelector(".swal2-container").style.zIndex =
            "9999"; // Adjust z-index here
        },
      });
    } else {
      throw new Error(
        `Failed to add product: ${response.status} ${response.statusText}`
      );
    }
  } else {
    const data = await response.json();
    console.log("Product added:", data);

    Swal.fire({
      icon: "success",
      title: "Product Added Successfully!",
      customClass: {
        popup: "z-50", // Apply Tailwind CSS class to adjust z-index
      },
      didOpen: () => {
        document.querySelector(".swal2-container").style.zIndex = "9999"; // Adjust z-index here
      },
    }).then(() => {
      handleClose(); // Close the dialog box
      window.location.reload(); // Reload the table data
      setTableDataChanged((prevState) => !prevState); // <--- Add this line to update the tableDataChanged state
    });
  }
} catch (error) {
  console.error("Error adding product:", error);
  Swal.fire({
    icon: "error",
    title: "Product Addition Failed",
    text: "An error occurred while adding the product.",
    customClass: {
      popup: "z-50", // Apply Tailwind CSS class to adjust z-index
    },
    didOpen: () => {
      document.querySelector(".swal2-container").style.zIndex = "9999"; // Adjust z-index here
    },
  });
}



//////////////////////////////////////////////////////////////////////////////////////



try {
  // Check if product already exists with the same drugname and genericname
  let productResult = await new Promise((resolve, reject) => {
    connection.query(
      `SELECT *
                     FROM product p
                     JOIN generic g ON p.genericID = g.genericID
                     WHERE p.drugname = ? AND g.genericName = ?`,
      [DrugName, GenericName],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });

  if (productResult.length) {
    res.status(400).json({ message: "Product already exists" });
    return;
  }

  // Check if category exists
  let categoryResult = await new Promise((resolve, reject) => {
    connection.query(
      "SELECT categoryID FROM category WHERE categoryName = ?",
      [categoryName],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });

  let finalCategoryID = categoryResult.length
    ? categoryResult[0].categoryID
    : null;

  if (!finalCategoryID) {
    // Insert new category
    let insertCategoryResult = await new Promise((resolve, reject) => {
      connection.query(
        "INSERT INTO category (`categoryName`) VALUES (?)",
        [categoryName],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
    finalCategoryID = insertCategoryResult.insertId;
  }

  // Check if generic exists
  let genericResult = await new Promise((resolve, reject) => {
    connection.query(
      "SELECT genericID FROM generic WHERE genericName = ?",
      [GenericName],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });

  let finalGenericID = genericResult.length
    ? genericResult[0].genericID
    : null;

  if (!finalGenericID) {
    // Insert new generic
    let insertGenericResult = await new Promise((resolve, reject) => {
      connection.query(
        "INSERT INTO generic (`genericName`) VALUES (?)",
        [GenericName],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
    finalGenericID = insertGenericResult.insertId;
  }

  // Set Description to null if it is empty
  let finalDescription = Description.trim() === "" ? null : Description;

  // Insert product
  let insertProductResult = await new Promise((resolve, reject) => {
    connection.query(
      "INSERT INTO product (`drugname`, `genericID`, `categoryID`, `restock_level`, `Description`) VALUES (?, ?, ?, ?, ?)",
      [
        DrugName,
        finalGenericID,
        finalCategoryID,
        restock_level,
        finalDescription,
      ],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });

  res.status(200).json({
    message: "Product added successfully",
    productId: insertProductResult.insertId,
  });
} catch (err) {
  console.error("Error inserting Product:", err);
  res.status(500).send("Internal Server Error");
}

/////////////////////////////////////////////////////////////////////

try {
  // Check if product already exists with the same drugname and genericname
  let productResult = await new Promise((resolve, reject) => {
    connection.query(
      `SELECT *
                         FROM product p
                         JOIN generic g ON p.genericID = g.genericID
                         WHERE p.drugname = ? AND g.genericName = ?`,
      [DrugName, GenericName],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });

  if (productResult.length) {
    res.status(400).json({ message: "Product already exists" });
    return;
  }

  // Check if category exists
  let categoryResult = await new Promise((resolve, reject) => {
    connection.query(
      "SELECT categoryID FROM category WHERE categoryName = ?",
      [categoryName],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });

  let finalCategoryID = categoryResult.length
    ? categoryResult[0].categoryID
    : null;

  if (!finalCategoryID) {
    // Insert new category
    let insertCategoryResult = await new Promise((resolve, reject) => {
      connection.query(
        "INSERT INTO category (`categoryName`) VALUES (?)",
        [categoryName],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
    finalCategoryID = insertCategoryResult.insertId;
  }

  // Check if generic exists
  let genericResult = await new Promise((resolve, reject) => {
    connection.query(
      "SELECT genericID FROM generic WHERE genericName = ?",
      [GenericName],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });

  let finalGenericID = genericResult.length
    ? genericResult[0].genericID
    : null;

  if (!finalGenericID) {
    // Insert new generic
    let insertGenericResult = await new Promise((resolve, reject) => {
      connection.query(
        "INSERT INTO generic (`genericName`) VALUES (?)",
        [GenericName],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
    finalGenericID = insertGenericResult.insertId;
  }

  // Set Description to null if it is empty
  let finalDescription = Description.trim() === "" ? null : Description;

  // Insert product
  let insertProductResult = await new Promise((resolve, reject) => {
    connection.query(
      "INSERT INTO product (`drugname`, `genericID`, `categoryID`, `restock_level`, `Description`,`image`) VALUES (?, ?, ?, ?, ?,?)",
      [
        DrugName,
        finalGenericID,
        finalCategoryID,
        restock_level,
        finalDescription,
        image,
      ],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });

  res.status(200).send({
    message: "Product added successfully",
    productId: insertProductResult.insertId,
  });
} catch (err) {
  console.error("Error inserting Product:", err);
  res.status(500).send("Internal Server Error");
}