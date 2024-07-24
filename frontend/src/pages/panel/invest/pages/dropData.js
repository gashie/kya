
function generateYearsBetween(startYear = 2000, endYear) {
    const endDate = endYear || new Date().getFullYear();
    let years = [];
  
    for (var i = startYear; i <= endDate; i++) {
      years.push(startYear);
      startYear++;
    }
    return years;
  }
   const allyears = generateYearsBetween(1922, new Date().getFullYear());
  export const yearsArray = allyears.map(item => ({'value':item, 'label':item}));
  
  export const filterDay = [
    { value: "31", label: "31" },
    { value: "30", label: "30" },
    { value: "29", label: "29" },
    { value: "28", label: "28" },
    { value: "27", label: "27" },
    { value: "26", label: "26" },
    { value: "25", label: "25" },
    { value: "24", label: "24" },
    { value: "23", label: "23" },
    { value: "22", label: "22" },
    { value: "21", label: "21" },
    { value: "20", label: "20" },
    { value: "19", label: "19" },
    { value: "18", label: "18" },
    { value: "17", label: "17" },
    { value: "16", label: "16" },
    { value: "15", label: "15" },
    { value: "14", label: "14" },
    { value: "13", label: "13" },
    { value: "12", label: "12" },
    { value: "11", label: "11" },
    { value: "10", label: "10" },
    { value: "09", label: "09" },
    { value: "08", label: "08" },
    { value: "07", label: "07" },
    { value: "06", label: "06" },
    { value: "05", label: "05" },
    { value: "04", label: "04" },
    { value: "03", label: "03" },
    { value: "02", label: "02" },
    { value: "01", label: "01" },
  ];

  export const filterMonth = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];
  
  export const filterYear = [
    { value: "2022", label: "2022" },
    { value: "2021", label: "2021" },
    { value: "2020", label: "2020" },
    { value: "2019", label: "2019" },
    { value: "27", label: "27" },
    { value: "26", label: "26" },
    { value: "25", label: "25" },
    { value: "24", label: "24" },
    { value: "23", label: "23" },
    { value: "22", label: "22" },
    { value: "21", label: "21" },
    { value: "20", label: "20" },
    { value: "19", label: "19" },
    { value: "18", label: "18" },
    { value: "17", label: "17" },
    { value: "16", label: "16" },
    { value: "15", label: "15" },
    { value: "14", label: "14" },
    { value: "13", label: "13" },
    { value: "12", label: "12" },
    { value: "11", label: "11" },
    { value: "10", label: "10" },
    { value: "09", label: "09" },
    { value: "08", label: "08" },
    { value: "07", label: "07" },
    { value: "06", label: "06" },
    { value: "05", label: "05" },
    { value: "04", label: "04" },
    { value: "03", label: "03" },
    { value: "02", label: "02" },
    { value: "01", label: "01" },
  ];
  