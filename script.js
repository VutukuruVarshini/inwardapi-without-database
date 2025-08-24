
// =========================
// Hardcoded Data & Login
// =========================
let currentUser = null;
let inwards = [
  {
    id: 1,
    gatein_number: 1,
    entry_date: '2025-08-24',
    vehicle_number: '12345679',
    vehicle_in_time: '21:22',
    supplier_name: 'sravya',
    supplier_code: '123',
    purchase_order: '123',
    po_type: 'book',
    invoice_number: '123',
    invoice_date: '2025-07-10',
    entered_by: 'security1',
    remarks: 'na'
  }
];

// =========================
// Utility Functions
// =========================
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// =========================
// LOGIN
// =========================
function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (email === 'hii@gmail.com' && password === 'hihihi') {
    currentUser = { email };
    loadInwards();
    showPage('dashboardPage');
  } else {
    alert('Invalid credentials');
  }
}

// =========================
// LOGOUT
// =========================
function logout() {
  currentUser = null;
  showPage('loginPage');
}

// =========================
// LOAD INWARDS
// =========================
function loadInwards() {
  const tbody = document.querySelector('#inwardTable tbody');
  tbody.innerHTML = '';

  inwards.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.gatein_number}</td>
      <td>${row.supplier_name}</td>
      <td>${row.entry_date}</td>
      <td>
        <button onclick="viewInward(${row.id})">View</button>
        <button onclick="downloadPDF(${row.id})">PDF</button>
        <button onclick="editInward(${row.id})">Edit</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

// =========================
// SHOW NEW INWARD FORM
// =========================
function showNewInwardForm() {
  const nextGateIn = inwards.length ? Math.max(...inwards.map(i=>i.gatein_number)) + 1 : 1;
  const today = new Date().toISOString().split('T')[0];

  ['gateinNumber','entryDate','vehicleNumber','vehicleTime','supplierName','supplierCode','purchaseOrder','poType','invoiceNumber','invoiceDate','enteredBy','remarks','editId']
    .forEach(id => document.getElementById(id).value = '');

  document.getElementById('gateinNumber').value = nextGateIn;
  document.getElementById('entryDate').value = today;

  showPage('newInwardPage');
}

// =========================
// EDIT INWARD
// =========================
function editInward(id) {
  const inward = inwards.find(i => i.id === id);
  if(!inward) return alert('Inward not found');

  for(const key in inward) {
    const el = document.getElementById(keyMap(key));
    if(el) el.value = inward[key];
  }

  showPage('newInwardPage');
}

function keyMap(key) {
  switch(key){
    case 'id': return 'editId';
    case 'gatein_number': return 'gateinNumber';
    case 'entry_date': return 'entryDate';
    case 'vehicle_number': return 'vehicleNumber';
    case 'vehicle_in_time': return 'vehicleTime';
    case 'supplier_name': return 'supplierName';
    case 'supplier_code': return 'supplierCode';
    case 'purchase_order': return 'purchaseOrder';
    case 'po_type': return 'poType';
    case 'invoice_number': return 'invoiceNumber';
    case 'invoice_date': return 'invoiceDate';
    case 'entered_by': return 'enteredBy';
    case 'remarks': return 'remarks';
  }
}

// =========================
// SAVE OR UPDATE INWARD
// =========================
function saveInwardOrUpdateInwards() {
  const id = document.getElementById('editId').value;
  const payload = {
    id: id ? parseInt(id) : (inwards.length ? Math.max(...inwards.map(i=>i.id))+1 : 1),
    gatein_number: document.getElementById('gateinNumber').value,
    entry_date: document.getElementById('entryDate').value,
    vehicle_number: document.getElementById('vehicleNumber').value.trim(),
    vehicle_in_time: document.getElementById('vehicleTime').value.trim(),
    supplier_name: document.getElementById('supplierName').value.trim(),
    supplier_code: document.getElementById('supplierCode').value.trim(),
    purchase_order: document.getElementById('purchaseOrder').value.trim(),
    po_type: document.getElementById('poType').value.trim(),
    invoice_number: document.getElementById('invoiceNumber').value.trim(),
    invoice_date: document.getElementById('invoiceDate').value.trim(),
    entered_by: document.getElementById('enteredBy').value.trim(),
    remarks: document.getElementById('remarks').value.trim()
  };

  const required = ['gatein_number','entry_date','vehicle_number','vehicle_in_time','supplier_name'];
  for(const f of required) if(!payload[f]) return alert('Required fields missing');

  if(id){
    const idx = inwards.findIndex(i => i.id == id);
    inwards[idx] = payload;
    alert('Updated successfully');
  } else {
    inwards.push(payload);
    alert('Saved successfully');
  }

  document.getElementById('editId').value = '';
  loadInwards();
  showPage('inwardListPage');
}

// =========================
// VIEW INWARD
// =========================
function viewInward(id) {
  const inward = inwards.find(i => i.id === id);
  if(!inward) return alert('Inward not found');

  let html = '';
  for(const [key,value] of Object.entries(inward)){
    if(key==='id') continue;
    const label = key.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase());
    html += `<li>${label}: ${value || '-'}</li>`;
  }
  document.getElementById('inwardDetails').innerHTML = html;
  showPage('viewInwardPage');
  document.getElementById('inwardDetails').dataset.id = id; // store current id for PDF
}

// =========================
// PDF DOWNLOAD
// =========================

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Draw border
  doc.setLineWidth(0.5);
  doc.rect(margin, margin, pageWidth - 2 * margin, doc.internal.pageSize.getHeight() - 2 * margin);

  // Get logo image from DOM
  const imgElement = document.querySelector('.logo');

  if (imgElement && imgElement.complete && imgElement.naturalWidth !== 0) {
    // Draw image on canvas to get base64 data
    const canvas = document.createElement('canvas');
    canvas.width = imgElement.naturalWidth;
    canvas.height = imgElement.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0);
    const imgData = canvas.toDataURL('image/png');

    // Add image to PDF
    const imgWidth = 40;
    const scale = imgWidth / imgElement.naturalWidth;
    const imgHeight = imgElement.naturalHeight * scale;

    doc.addImage(imgData, 'PNG', margin + 5, margin + 5, imgWidth, imgHeight);
  } else {
    console.warn('Logo image not loaded or not found');
  }

  // Add Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('GateIN Form', margin + 50, margin + 15);

  // Add a horizontal line
  doc.setLineWidth(0.3);
  doc.line(margin, margin + 20, pageWidth - margin, margin + 20);

  // Example Data Fields
  const fields = [
    ['GateIn #', '1'],
    ['Date', '2025-08-24'],
    ['Vehicle #', '12345679'],
    ['Vehicle In Time', '21:22'],
    ['Supplier', 'sravya'],
    ['Supplier Code', '123'],
    ['Purchase Order', '123'],
    ['PO Type', 'book'],
    ['Invoice #', '123'],
    ['Invoice Date', '2025-07-10'],
    ['Entered By', 'security1'],
    ['Remarks', 'na']
  ];

  // Print the fields
  doc.setFontSize(12);
  let startY = margin + 35;
  const lineGap = 10;
  fields.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', margin + 5, startY);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 55, startY);
    startY += lineGap;
  });

  // Save PDF
  doc.save('GateIN_1.pdf');
}




// =========================
// AUTO LOAD
// =========================
window.addEventListener('DOMContentLoaded', ()=>{
  showPage('loginPage');

  // Make PDF link in view page work
  document.getElementById('pdfDownload').addEventListener('click', function(e){
    e.preventDefault();
    const inwardId = parseInt(document.getElementById('inwardDetails').dataset.id);
    downloadPDF(inwardId);
  });
});
