document.addEventListener("DOMContentLoaded", (event) => {
    // Navbar shrink function
    const navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector("#mainNav");
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove("navbar-shrink");
        } else {
            navbarCollapsible.classList.add("navbar-shrink");
        }
    };

    // Shrink the navbar
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener("scroll", navbarShrink);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector("#mainNav");
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: "#mainNav",
            rootMargin: "0px 0px -40%",
        });
    }

    const navbarToggler = document.body.querySelector(".navbar-toggler");
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll("#navbarResponsive .nav-link")
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener("click", () => {
            if (window.getComputedStyle(navbarToggler).display !== "none") {
                navbarToggler.click();
            }
        });
    });

    // Scroll to top when the page is loaded
    window.scrollTo(0, 0);
});

let memberFileDetails = null;
let leaderFileDetails = null;
let memberFileData = [];
let leaderFileData = [];
let filesUploaded = [false,false]; // To track the number of files uploaded

// Function to open member file picker
function openMemberFilePicker() {
    const inputElement = document.createElement("input");
    inputElement.type = "file";
    inputElement.accept = ".xlsx";
    inputElement.addEventListener("change", handleMemberFileSelection);
    inputElement.click();
}

// Function to open leader file picker
function openLeaderFilePicker() {
    const inputElement = document.createElement("input");
    inputElement.type = "file";
    inputElement.accept = ".xlsx";
    inputElement.addEventListener("change", handleLeaderFileSelection);
    inputElement.click();
}

// Function to handle member file selection
function handleMemberFileSelection(event) {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
        console.log("Selected member file:", selectedFile.name);
        memberFileDetails = selectedFile;
        document.getElementById("member-file-name").textContent = selectedFile.name;
        processMemberFile();
    }
}

// Function to handle leader file selection
function handleLeaderFileSelection(event) {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
        console.log("Selected leader file:", selectedFile.name);
        leaderFileDetails = selectedFile;
        document.getElementById("leader-file-name").textContent = selectedFile.name;
        processLeaderFile();
    }
}

// Function to process member file
function processMemberFile() {
    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        memberFileData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        filesUploaded[0] = filesUploaded[0] ? true : true ;
        checkFilesUploaded();
    };
    reader.readAsArrayBuffer(memberFileDetails);
}

// Function to process leader file
function processLeaderFile() {
    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        leaderFileData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        filesUploaded[1] = filesUploaded[1] ? true : true ;
        checkFilesUploaded();
    };
    reader.readAsArrayBuffer(leaderFileDetails);
}

// Function to check if both files are uploaded
function checkFilesUploaded() {
    if (filesUploaded[0] && filesUploaded[1]) {
        displayFileContent();
        document.getElementById("create-groups").disabled = false; // Enable the download button
    }
}

// Function to display file content
function displayFileContent() {
    document
        .getElementById("file-content")
        .scrollIntoView({ behavior: "smooth" });
    document.getElementById("file-content").classList.remove("visually-hidden");
}

// Function to remove file
function removeFile() {
    document.getElementById("file-content").classList.add("visually-hidden");
    document
        .getElementById("page-top")
        .scrollIntoView({ behavior: "smooth", block: "start" });
    memberFileDetails = null; // Reset file details
    leaderFileDetails = null; // Reset file details
    memberFileData = [];
    leaderFileData = [];
    filesUploaded[0] = false; // Reset the file upload count
    filesUploaded[1] = false; // Reset the file upload count
    document.getElementById("member-file-name").textContent = "";
    document.getElementById("leader-file-name").textContent = "";
    document.getElementById("download-button").disabled = true; // Disable the download button
}

// Function to create groups and download
function createGroupsAndDownload() {
    if (!memberFileDetails || !leaderFileDetails) {
        alert("Please select both member and leader files.");
        return;
    }

    if (memberFileData[0][0].isNaN || (memberFileData[0][0][0] == 'r' || 'R') || (memberFileData[0][1][0] == 'n' || 'N')) {
        memberFileData = memberFileData.slice(1); // Skip the header row of the member file
    }

    if (leaderFileData[0][0].isNaN || (leaderFileData[0][0][0] == 'r' || 'R') || (leaderFileData[0][1][0] == 'n' || 'N')) {
        leaderFileData = leaderFileData.slice(1); // Skip the header row
    }

    console.log(memberFileData);
    console.log(leaderFileData);

    // Remove leaders and sub-leaders from the member list
    memberFileData = memberFileData.filter(
        (member) =>
            !leaderFileData.some(
                (leader) =>
                    leader[0] === member[0] || (leader[2] && leader[2] === member[0])
            )
    );

    const shuffledMembers = shuffleArray(memberFileData);
    const shuffledLeaders = shuffleArray(leaderFileData);
    const totalGroups = shuffledLeaders.length; // Number of groups is determined by the number of leaders available

    const groupLength = Math.ceil(
        (shuffledMembers.length + shuffledLeaders.length) / totalGroups
    );

    console.log(totalGroups);

    let groups = Array.from({ length: totalGroups }, () => []);
    shuffledLeaders.forEach((leader, i) => {
        groups[i].push(leader); // Assign one leader to each group
    });

    // Distribute members evenly across groups
    let memberCounter = 0;
    let index = 0;
    while (memberCounter < shuffledMembers.length) {
        groups[index++ % totalGroups].push(shuffledMembers[memberCounter++]);
    }


    console.log(memberCounter);
    console.log(shuffledMembers);

    // Equalize group sizes by adding blank rows
    groups.forEach((group) => {
        while (group.length < groupLength) {
            group.push(["", ""]); // Add empty rows
        }
    });

    // Prepare data for the Excel file
    let allGroups = [];

    // Add groups with merged headers
    groups.forEach((group, index) => {
        // Add group header
        allGroups.push([`Group - ${index + 1}`, ""]); // Leave the second column blank
        group.forEach(([id, name]) => {
            allGroups.push([id, name]); // Add group members
            console.log(id, name);
        });
        allGroups.push(["", ""]); // Add a blank row after each group
    });

    // allGroups.map((group) => {console.log(group)});

    // Create Excel file
    const worksheet = XLSX.utils.aoa_to_sheet(allGroups);

    // Merge group headers
    let rowIndex = 0;
    groups.forEach((group, index) => {
        worksheet[`A${rowIndex + 1}`].s = { font: { bold: true } }; // Apply bold style to header
        // worksheet["!merges"] = worksheet["!merges"] || [];
        // worksheet["!merges"].push({
        //     s: { r: rowIndex, c: 0 }, // Start cell (rowIndex, col 0)
        //     e: { r: rowIndex, c: 1 }, // End cell (rowIndex, col 1)
        // });
        // rowIndex += group.length + 2; // Increment row index by group size + header + blank row
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Groups");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    // Create a download link and click it to download the file
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Groups.xlsx";
    a.click();
    URL.revokeObjectURL(url);
}

function shuffleArray(array) {
    let currentIndex = array.length,
        temporaryValue,
        randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

// ====== Horizontal Groups With Roll No Only ====== //
// window.addEventListener("load", () => {
//     window.scrollTo(0, 0);
//   });

//   // Other JavaScript code for handling file uploads and group creation...
//   let memberFileDetails = null;
//   let leaderFileDetails = null;
//   let memberFileData = [];
//   let leaderFileData = [];
//   let filesUploaded = 0; // To track the number of files uploaded

//   // Function to open member file picker
//   function openMemberFilePicker() {
//     const inputElement = document.createElement("input");
//     inputElement.type = "file";
//     inputElement.accept =
//       ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel";
//     inputElement.addEventListener("change", handleMemberFileSelection);
//     inputElement.click();
//   }

//   // Function to open leader file picker
//   function openLeaderFilePicker() {
//     const inputElement = document.createElement("input");
//     inputElement.type = "file";
//     inputElement.accept =
//       ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel";
//     inputElement.addEventListener("change", handleLeaderFileSelection);
//     inputElement.click();
//   }

//   // Function to handle member file selection
//   function handleMemberFileSelection(event) {
//     const selectedFile = event.target.files[0];
//     if (selectedFile) {
//       memberFileDetails = selectedFile;
//       document.getElementById("member-file-name").textContent = selectedFile.name;
//       processMemberFile();
//     }
//   }

//   // Function to handle leader file selection
//   function handleLeaderFileSelection(event) {
//     const selectedFile = event.target.files[0];
//     if (selectedFile) {
//       leaderFileDetails = selectedFile;
//       document.getElementById("leader-file-name").textContent = selectedFile.name;
//       processLeaderFile();
//     }
//   }

//   // Function to process member file
//   function processMemberFile() {
//     const reader = new FileReader();
//     reader.onload = function (e) {
//       const data = new Uint8Array(e.target.result);
//       const workbook = XLSX.read(data, { type: "array" });
//       const sheet = workbook.Sheets[workbook.SheetNames[0]];
//       memberFileData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
//       filesUploaded++;
//       checkFilesUploaded();
//     };
//     reader.readAsArrayBuffer(memberFileDetails);
//   }

//   // Function to process leader file
//   function processLeaderFile() {
//     const reader = new FileReader();
//     reader.onload = function (e) {
//       const data = new Uint8Array(e.target.result);
//       const workbook = XLSX.read(data, { type: "array" });
//       const sheet = workbook.Sheets[workbook.SheetNames[0]];
//       leaderFileData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
//       filesUploaded++;
//       checkFilesUploaded();
//     };
//     reader.readAsArrayBuffer(leaderFileDetails);
//   }

//   // Function to check if both files are uploaded
//   function checkFilesUploaded() {
//     if (filesUploaded === 2) {
//       displayFileContent();
//       document.getElementById("file-name").textContent = "Groups.xlsx"; // Update file name
//     }
//   }

//   // Function to display file content
//   function displayFileContent() {
//     document
//       .getElementById("file-content")
//       .scrollIntoView({ behavior: "smooth" });
//     document.getElementById("file-content").classList.remove("visually-hidden");
//   }

//   // Function to remove file
//   function removeFile() {
//     document.getElementById("file-content").classList.add("visually-hidden");
//     document
//       .getElementById("page-top")
//       .scrollIntoView({ behavior: "smooth", block: "start" });
//     memberFileDetails = null; // Reset file details
//     leaderFileDetails = null; // Reset file details
//     memberFileData = [];
//     leaderFileData = [];
//     filesUploaded = 0; // Reset the file upload count
//     document.getElementById("member-file-name").textContent = "";
//     document.getElementById("leader-file-name").textContent = "";
//   }

//   // Function to create groups
//   function createGroupsAndDownload() {
//     if (!memberFileDetails || !leaderFileDetails) {
//       alert("Please select both member and leader files.");
//       return;
//     }

//     // Remove leaders from the member list
//     memberFileData = memberFileData.filter(
//       (member) => !leaderFileData.some((leader) => leader[0] === member[0])
//     );

//     const shuffledMembers = shuffleArray(memberFileData);
//     const shuffledLeaders = shuffleArray(leaderFileData);
//     const totalGroups = shuffledLeaders.length; // Number of groups is determined by the number of leaders available
//     let groups = [];

//     // Create groups with one leader each
//     for (let i = 0; i < totalGroups; i++) {
//       let group = [shuffledLeaders[i]]; // Start the group with the leader
//       groups.push(group);
//     }

//     // Distribute members among the groups
//     let groupIndex = 0;
//     for (let i = 0; i < shuffledMembers.length; i++) {
//       groups[groupIndex].push(shuffledMembers[i]);
//       groupIndex = (groupIndex + 1) % totalGroups;
//     }

//     // Find the maximum group size for row padding
//     const maxGroupSize = Math.max(...groups.map((group) => group.length));

//     // Prepare data for a single sheet with groups in columns
//     let allGroups = [];
//     for (let i = 0; i < maxGroupSize; i++) {
//       let row = [];
//       for (let j = 0; j < totalGroups; j++) {
//         row.push(groups[j][i] || ""); // Fill with empty strings if no member
//       }
//       allGroups.push(row);
//     }

//     // Create a new workbook and worksheet
//     let workbook = XLSX.utils.book_new();
//     let worksheet = XLSX.utils.aoa_to_sheet(allGroups);

//     // Apply styles to the cells
//     for (let col = 0; col < totalGroups; col++) {
//       for (let row = 0; row < maxGroupSize; row++) {
//         let cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
//         if (worksheet[cellAddress]) {
//           if (row === 0) {
//             worksheet[cellAddress].s = {
//               fill: { bgColor: { rgb: "FFFF00" } }, // Yellow for leader
//             };
//           } else {
//             worksheet[cellAddress].s = {
//               fill: { fgColor: { rgb: "ADD8E6" } }, // Light Blue for members
//             };
//           }
//         }
//       }
//     }

//     // Append the worksheet to the workbook
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Groups");

//     // Write the workbook to a file
//     XLSX.writeFile(workbook, "Groups.xlsx");
//   }

//   // Function to shuffle an array
//   function shuffleArray(array) {
//     let currentIndex = array.length,
//       temporaryValue,
//       randomIndex;
//     while (currentIndex !== 0) {
//       randomIndex = Math.floor(Math.random() * currentIndex);
//       currentIndex -= 1;
//       temporaryValue = array[currentIndex];
//       array[currentIndex] = array[randomIndex];
//       array[randomIndex] = temporaryValue;
//     }
//     return array;
//   }

//   document.addEventListener("DOMContentLoaded", (event) => {
//     // Navbar shrink function
//     const navbarShrink = function () {
//       const navbarCollapsible = document.body.querySelector("#mainNav");
//       if (!navbarCollapsible) {
//         return;
//       }
//       if (window.scrollY === 0) {
//         navbarCollapsible.classList.remove("navbar-shrink");
//       } else {
//         navbarCollapsible.classList.add("navbar-shrink");
//       }
//     };

//     // Shrink the navbar
//     navbarShrink();

//     // Shrink the navbar when page is scrolled
//     document.addEventListener("scroll", navbarShrink);

//     // Activate Bootstrap scrollspy on the main nav element
//     const mainNav = document.body.querySelector("#mainNav");
//     if (mainNav) {
//       new bootstrap.ScrollSpy(document.body, {
//         target: "#mainNav",
//         rootMargin: "0px 0px -40%",
//       });
//     }

//     const navbarToggler = document.body.querySelector(".navbar-toggler");
//     const responsiveNavItems = [].slice.call(
//       document.querySelectorAll("#navbarResponsive .nav-link")
//     );
//     responsiveNavItems.map(function (responsiveNavItem) {
//       responsiveNavItem.addEventListener("click", () => {
//         if (window.getComputedStyle(navbarToggler).display !== "none") {
//           navbarToggler.click();
//         }
//       });
//     });

//     // Scroll to top when the page is loaded
//     window.scrollTo(0, 0);
//   });
