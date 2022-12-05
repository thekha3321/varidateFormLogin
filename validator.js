// doi tuong `validator`
function Validator (options) {
    console.log(options);
    var selectorRules = {};

    // hàm thực hiện varidate
    function varidate (inputElement, rule) {
        var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
        var errorMessage;
        
        // lấy ra các rule của selector
        var rules = selectorRules[rule.selector]
        
        // lặp qua từng rule và kiểm tra
        // nếu có lỗi thì dừng việc kiêm tra
        for(var i = 0; i < rules.length; ++i) {
            errorMessage = rules[i](inputElement.value)
            if(errorMessage) break;
        }

        if(errorMessage) {
            errorElement.innerHTML = errorMessage;
            inputElement.parentElement.classList.add('invalid');
        }else {
            errorElement.innerHTML = '';
            inputElement.parentElement.classList.remove('invalid');
        }
        return !errorMessage;
    }
    // lấy element của form cần validate
    var formElement = document.querySelector(options.form);
    if(formElement) {
        // loại bỏ hành vi mặc đình khi submit form
        formElement.onsubmit = function (e) {
            e.preventDefault();

            var isFormValid = true;

            // thực hiện lặp qua từng rules và varidate
            options.rules.forEach(function (rule) { 
                var inputElement = formElement.querySelector(rule.selector);                   
                var isValid = varidate(inputElement, rule);        
                if(!isValid) {
                    isFormValid = false;
                }   
            });

            if(isFormValid) {
                if(typeof options.onsubmit == 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])'); 
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        values[input.name] = input.value;
                        return values;
                    }, {});

                    options.onsubmit(formValues)
                }
                else {
                    formElement.submit();
                }
            }
        }
    }

        // xử lý lặp qua mỗi rule và xử lý ( lắng nghe sự kiên, blur, input)
        options.rules.forEach(function (rule) {

            // lưu lại các rule cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            }else {
                selectorRules[rule.selector] = [rule.test];
            }
            // selectorRules[rule.selector] = rule.test;

            var inputElement = formElement.querySelector(rule.selector);
            
            if(inputElement) {
                // xử lí trường hợp blur khỏi input
                inputElement.onblur = function () {
                    varidate(inputElement, rule);           
                }

                // xử lí mỗi khi người dùng nhập vào input
                inputElement.oninput = function () {
                    var errorElement = inputElement.parentElement.querySelector(options.errorSelector );
                    errorElement.innerHTML = '';
                    inputElement.parentElement.classList.remove('invalid');
                }
            }
        })
    }

// dinh nghia cac rules
// nguyen tac cua cac rules:
// 1. khi co loi => tra ra message loi
// 2. khi hop le => khong tra ra gi ca
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
             return value.trim() ? undefined : message || 'vui lòng nhập trường này'
        }
    }   
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
             var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
             return regex.test(value) ? undefined : message || 'trường này phải là Email';
        }
    } 
}

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `vui lòng nhập tối thiểu ${min}`
        }
    } 
}
Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
         test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'giá trị nhập vào không chính xác';
        }
    }
}