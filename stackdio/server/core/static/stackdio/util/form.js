/*!
  * Copyright 2014,  Digital Reasoning
  * 
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  * 
  *     http://www.apache.org/licenses/LICENSE-2.0
  * 
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  * 
*/

define(function () {
    return {
        clearForm: function (id) {
            var i, form = document.getElementById(id), elements = form.elements;

            for (i = 0; i < elements.length; i++) {
                field_type = elements[i].type.toLowerCase();
                switch (field_type) {
                case "text":
                case "password":
                case "textarea":
                case "hidden":
                    elements[i].value = "";
                    break;
                case "number":
                    elements[i].value = NaN;
                    break;
                case "radio":
                case "checkbox":
                    if (elements[i].checked) {
                        elements[i].checked = false;
                    }
                    break;
                case 'select-one':
                    elements[i].selectedIndex = elements[i].options.length > 0 ? 0 : -1;
                    break;
                case 'select-multi':
                case 'select-multiple':
                    elements[i].selectedIndex = -1;
                    break;
                default:
                    break;
                }
            }
        },
        collectFormFields: function (obj) {
            var i, item, el, form = {}, id, idx;
            var o, option, options, selectedOptions;

            // Collect the fields from the form
            for (i = 0; i < obj.elements.length; ++i) {
                item = obj.elements[i];
                if(item !== null) {
                  field_type = item.type.toLowerCase();
                    id = item.id;
                    form[id] = {};

                    switch (field_type) {
                        case 'textarea':
                            form[id].text = item.text;
                            form[id].value = item.value;
                            break;
                        case 'checkbox':
                            form[id].text = '';
                            form[id].value = item.checked;
                            break;
                        case 'hidden':
                        case 'text':
                        case 'password':
                            if (item.files === null) {
                                form[id].text = item.text;
                                form[id].value = item.value;
                            }
                            else {
                                form[id].text = '';
                                form[id].value = '';
                                form[id].files = item.files;
                            }
                            break;
                        case 'number':
                            form[id].text = item.text;
                            form[id].value = parseInt(item.value);
                            break;
                        case 'select-one':
                        case 'select-multi':
                        case 'select-multiple':
                            el = document.getElementById(id);

                            if (el.multiple) {
                                form[id] = [];
                                options = el.selectedOptions;
                                for (o in options) {
                                    option = options[o];
                                    if (typeof option.text !== 'undefined') {
                                        form[id].push({ text: option.text, value: option.value });
                                    }
                                }
                            } else {
                                idx = el.selectedIndex;
                                if (idx !== -1) {
                                    form[id].text = el[idx].text;
                                    form[id].value = el[idx].value;
                                    form[id].selectedIndex = idx;
                                }
                            }

                            break;
                    }
                }
            }

            return form;
        }
    }
});
