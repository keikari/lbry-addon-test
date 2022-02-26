


let main_div = document.querySelector("#main_div");
console.log(document.body);
function test() {console.log("test");}

let create_category_div  = document.createElement("div");
let create_category_label = document.createElement("p");
create_category_label.inner = "Create Category";


create_category_div.append(create_category_label);
main_div.append(create_category_div);

