const table = document.getElementById('icon-line-table');
const addRowBtn = document.getElementById('add-row');
const tblSlider = document.querySelector('.tbl-slider');
const sliderContainer = document.querySelector('.slider-container');

let rowId = 1;

const relocateSlider = (referenceElement) => {
    referenceRect = referenceElement.getBoundingClientRect();
    const sliderRect = sliderContainer.getBoundingClientRect();
    sliderContainer.style.position = 'absolute';
    sliderContainer.style.visibility = 'visible';
    sliderContainer.style.top = referenceRect.top - referenceRect.height / 2 + 'px';
    sliderContainer.style.left = referenceRect.left + (referenceRect.width - sliderRect.width) / 2 + 'px';
}

const addRowToTable = () => {
    const row = document.createElement('tr');
    row.id = `row-${rowId}`;

    // ID column
    row.innerHTML += `<td class="non-selectable">${rowId}</th>`;

    // Name column
    const nameInput = document.createElement('input');
    nameInput.setAttribute('type', 'text');
    nameInput.setAttribute('name', 'name-input');
    nameInput.classList.add('name-input');
    row.innerHTML += `<td>${nameInput.outerHTML}</th>`;

    // Icon column
    // TODO: should be able to switch this with dropdown
    row.innerHTML += `<td><img src="home.png"></td>`

    // Numeric columns
    for (let i = 0; i < 5; i++) {
        // row.innerHTML += `<td>${(Math.random() * 10).toFixed(2)}</td>`;
        const transparencyInput = document.createElement('input');
        transparencyInput.setAttribute('type', 'text');
        transparencyInput.setAttribute('name', 'tbl-range');
        transparencyInput.setAttribute('value', 50);
        transparencyInput.classList.add('tbl-range');
        row.innerHTML += `<td class="tbl-selectable">${transparencyInput.outerHTML}</th>`;
    }

    // Legend checkbox
    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.id = 'legend-checkbox';
    row.innerHTML += `<td class="legend-td">${checkbox.outerHTML}</th>`;

    // Row deleter button
    const deleter = document.createElement('i');
    deleter.classList.add('row-deleter', 'fa', 'fa-times');
    deleter.id = `deleter-${rowId}`;
    row.innerHTML += `<td>${deleter.outerHTML}</td>`

    table.appendChild(row);
    rowId++;
}

addRowBtn.addEventListener('click', addRowToTable);

tblSlider.addEventListener('input', e => {
    const selectedElem = document.querySelector('.tbl-selected');
    selectedElem ? selectedElem.children['tbl-range'].value = e.target.value : false;
});

// Event listener for the whole window to capture table events
window.addEventListener('click', e => {
    if (!e.target.classList.contains('tbl-selectable') &&
        !e.target.classList.contains('tbl-slider') &&
        !e.target.classList.contains('tbl-range')) {
        const selectedElem = document.querySelector('.tbl-selected');
        if (selectedElem) {
            selectedElem.classList.remove('tbl-selected')
            sliderContainer.style.visibility = 'hidden';
        }
    }
    if (e.target.classList.contains('tbl-range')) {
        document.querySelectorAll('.tbl-selectable').forEach(elem => {
            elem.classList.contains('tbl-selected') ? elem.classList.remove('tbl-selected') : false;
        })

        e.target.parentNode.classList.add('tbl-selected');
        tblSlider.value = e.target.value;

        relocateSlider(e.target);
    }
    if (e.target.classList.contains('tbl-selectable')) {
        document.querySelectorAll('.tbl-selectable').forEach(elem => {
            elem.classList.contains('tbl-selected') ? elem.classList.remove('tbl-selected') : false;
        })

        e.target.classList.add('tbl-selected');
        tblSlider.value = e.target.children['tbl-range'].value;
        e.target.children['tbl-range'].focus();

        relocateSlider(e.target.children['tbl-range']);
    }
    if (e.target.classList.contains('legend-td')) {
        const checkbox = e.target.children['legend-checkbox'];
        checkbox.checked = !checkbox.checked;
    }
    if (e.target.classList.contains('row-deleter')) {
        const rowIndex = e.target.closest("tr").rowIndex;
        table.deleteRow(rowIndex);
    }
})
