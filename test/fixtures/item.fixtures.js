function getItemsArray() {
  return [
    {
      name: "itemOne",
      description: "Consectetur ipsum dolor officia et consequat.",
      quantity: 2,
      project_id:1,
      acquisition_id: 3,
      acquired: true,
    },
    {
      name: "itemTwo",
      description:
        "Incididunt aliqua fugiat voluptate aliqua voluptate eu magna cupidatat aliquip occaecat ea laboris ea.",
      quantity: 1,
      project_id: 1,
      acquisition_id: null,
      acquired: false,
    },
    {
      name: "itemThree",
      description: "Ea eiusmod cillum elit elit cillum minim pariatur.",
      project_id: 1,
      quantity:50,
      acquisition_id: 1,
      acquired:true
    },
  ];
}

module.exports = getItemsArray;
