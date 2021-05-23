function getAcquisitionsArray(){
  return [
    {project_id:1, total:50, date:'2021-05-01',acquisition_type:'purchase'},
    {project_id:2, total:500, date:'2021-05-01',acquisition_type:'rental'},
    {project_id:3, total:0, date:'2021-07-01',acquisition_type:'construction'},
    {project_id:1, total:50, date:'2021-06-01',acquisition_type:'purchase'},
    {project_id:2, total:50, date:'2021-02-30',acquisition_type:'purchase'}
  ]
}

module.exports = getAcquisitionsArray