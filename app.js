//// BUDGET CONTROLLER MODULE
const budgetController = (function() {
  // Function Constructor - Expense
  const Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  // Function Constructor - Income
  const Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  // Function - Calculate Total
  const calculateTotal = type => {
    let sum = 0;
    data.allItems[type].forEach(item => {
      sum = sum + item.value;
    });
    data.totals[type] = sum;
  };

  // Data Structure
  const data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  // Public return for Budget Controller
  return {
    addItem: (type, des, val) => {
      let newItem, ID;

      // ID = last ID + 1
      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Create new item based on 'inc' or 'exp' type
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }

      // Push the new item to the data structure
      data.allItems[type].push(newItem);

      // Return the new element
      return newItem;
    },
    deleteItem: (type, id) => {
      let ids, index;

      ids = data.allItems[type].map(item => {
        return item.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: () => {
      // Calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      // Calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // Calculate the percentage of income that is spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentages: () => {
      data.allItems.exp.forEach(item => {
        item.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: () => {
      let allPercentages = data.allItems.exp.map(item => {
        return item.getPercentage();
      });
      return allPercentages;
    },
    getBudget: () => {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    }
  };
})();

//// UI CONTROLLER MODULE
const UIController = (function() {
  const DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  const formatNumber = (num, type) => {
    let numSplit, int, dec;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  // Function - Node List For Each
  const nodeListForEach = (list, callback) => {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  // Public return for UI Controller
  return {
    getInput: () => {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // will either be inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },
    addListItem: (obj, type) => {
      let html, element;

      // 1. Create HTML string
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;

        html = `<div class="item clearfix" id="inc-${
          obj.id
        }"><div class="item__description">${
          obj.description
        }</div><div class="right clearfix"><div class="item__value">${formatNumber(
          obj.value,
          type
        )}</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer;

        html = `<div class="item clearfix" id="exp-${
          obj.id
        }"><div class="item__description">${
          obj.description
        }</div><div class="right clearfix"><div class="item__value">${formatNumber(
          obj.value,
          type
        )}</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
      }

      // 2. Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', html);
    },
    deleteListItem: selectorID => {
      const el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },
    clearFields: () => {
      let fields, fieldsArr;

      fields = document.querySelectorAll(
        `${DOMstrings.inputDescription}, ${DOMstrings.inputValue}`
      );

      // convert the list into an array
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(field => {
        field.value = '';
      });

      fieldsArr[0].focus();
    },

    displayBudget: obj => {
      let type;
      obj.budget > 0 ? (type = 'inc') : (type = 'exp');

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        'inc'
      );
      document.querySelector(
        DOMstrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, 'exp');

      // Show percentage only if greater than 0
      if (obj.percentage > 0) {
        document.querySelector(
          DOMstrings.percentageLabel
        ).textContent = `${obj.percentage}%`;
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },
    displayPercentages: percentages => {
      let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, (current, index) => {
        if (percentages[index] > 0) {
          current.textContent = `${percentages[index]}%`;
        } else {
          current.textContent = '---';
        }
      });
    },
    displayMonth: () => {
      let now, month, year, months;
      now = new Date();

      months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];
      month = now.getMonth();

      year = now.getFullYear();
      document.querySelector(
        DOMstrings.dateLabel
      ).textContent = `${months[month]} ${year}`;
    },
    changedType: () => {
      let fields = document.querySelectorAll(
        `${DOMstrings.inputType}, ${DOMstrings.inputDescription}, ${DOMstrings.inputValue}`
      );

      nodeListForEach(fields, field => {
        field.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },
    getDOMstrings: () => {
      return DOMstrings;
    }
  };
})();

//// APP CONTROLLER MODULE - Conjuncts The budgetController & UIController Modules
const controller = (function(budgetCtrl, UICtrl) {
  // Function - Set Up Event Listeners
  const setUpEventListeners = () => {
    const DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', e => {
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener('click', ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener('change', UICtrl.changedType);
  };

  // Function - Update Budget
  const updateBudget = () => {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();

    // 2. Return the budget
    const budget = budgetCtrl.getBudget();

    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  // Function - Update Percentages
  const updatePercentages = () => {
    // 1. Calculate percentages
    budgetCtrl.calculatePercentages();

    // 2. Read percentages from the budget controller
    let percentages = budgetCtrl.getPercentages();

    // 3. Update the UIwith the new percentages
    UICtrl.displayPercentages(percentages);
  };

  // Function - Add Item
  const ctrlAddItem = () => {
    let input, newItem;

    // 1. Get the field input data
    input = UICtrl.getInput();

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budgetController
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      // 4. Clear the fields
      UICtrl.clearFields();

      // 5. Calculate and update budget
      updateBudget();

      // 6. Calculate and update percentages
      updatePercentages();
    }
  };

  // Function - Ctrl Delete Item
  const ctrlDeleteItem = e => {
    let itemID, splitID, type, ID;

    itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);

      // 2. Delete the item from the UI
      UICtrl.deleteListItem(itemID);

      // 3. Update and show the new budget
      updateBudget();

      // 4. Calculate and update percentages
      updatePercentages();
    }
  };

  // Public return for App Controller
  return {
    init: () => {
      console.log('Application has started.');
      UICtrl.displayMonth();
      // Initially set everything to 0
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setUpEventListeners();
    }
  };
})(budgetController, UIController);

// Initialize Program
controller.init();
