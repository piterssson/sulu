define(["app-config","widget-groups"],function(a,b){"use strict";var c={localizationsUrl:"/admin/api/localizations",localizationConnector:"-",permissionGridId:"#permissions-grid",permissionLoaderClass:".permission-loader"},d=function(){var a=[{id:"save-button",icon:"floppy-o",iconSize:"large","class":"highlight",position:1,group:"left",disabled:!0,callback:function(){this.sandbox.emit("sulu.header.toolbar.save")}.bind(this)}],b={icon:"gear",iconSize:"large",group:"left",id:"options-button",position:30,items:[{title:this.sandbox.translate("toolbar.delete"),callback:function(){this.sandbox.emit("sulu.header.toolbar.delete")}.bind(this)}]},c={confirm:{title:this.sandbox.translate("security.user.activate"),callback:function(){this.sandbox.emit("sulu.user.activate")}.bind(this)}};this.user.enabled||b.items.push(c.confirm),b.items.length>0&&a.push(b),this.sandbox.emit("sulu.header.set-toolbar",{template:a})};return{name:"Sulu Security Permissions Form",layout:function(){return{content:{width:b.exists("contact-detail")?"max":"fixed"},sidebar:{width:"fixed",cssClasses:"sidebar-padding-50"}}},templates:["/admin/security/template/permission/form"],view:!0,initialize:function(){this.saved=!0,this.formId="#permissions-form",this.selectedRoles=[],this.deselectedRoles=[],this.systemLanguage=null,this.options.data?(this.user=this.options.data.user,this.contact=this.options.data.contact,this.roles=this.options.data.roles):this.sandbox.logger.log("no data given"),this.setTitle(),this.render(),this.initializeRoles(),this.bindCustomEvents(),this.initializeHeaderbar(),this.sandbox.form.create(this.formId),this.options.data.contact&&this.options.data.contact.id&&b.exists("contact-detail")&&this.initSidebar("/admin/widget-groups/contact-detail?contact=",this.options.data.contact.id)},initSidebar:function(a,b){this.sandbox.emit("sulu.sidebar.set-widget",a+b)},initializeHeaderbar:function(){this.currentType="",this.currentState="",this.setHeaderBar(!0),this.listenForChange()},setHeaderBar:function(a){if(a!==this.saved){var b=this.options.data&&this.options.data.id?"edit":"add";this.sandbox.emit("sulu.header.toolbar.state.change",b,a,!0)}this.saved=a},listenForChange:function(){this.sandbox.dom.on(this.formId,"change",function(){this.setHeaderBar(!1)}.bind(this),".changeListener select, .changeListener input, .changeListener textarea"),this.sandbox.dom.on(this.formId,"keyup",function(){this.setHeaderBar(!1)}.bind(this),".changeListener select, .changeListener input, .changeListener textarea"),this.sandbox.on("husky.select.systemLanguage.selected.item",function(){this.setHeaderBar(!1)}.bind(this)),this.sandbox.util.each(this.roles,function(a,b){this.sandbox.on("husky.select.languageSelector"+b.id+".selected.item",function(){this.setHeaderBar(!1)},this),this.sandbox.on("husky.select.languageSelector"+b.id+".deselected.item",function(){this.setHeaderBar(!1)},this)}.bind(this))},setTitle:function(){var a=this.sandbox.translate("contact.contacts.title"),b=[{title:"navigation.contacts"},{title:"contact.contacts.title",event:"sulu.contacts.contacts.list"}];this.options.data.contact&&this.options.data.contact.id&&(a=this.options.data.contact.fullName,b.push({title:"#"+this.options.data.contact.id})),this.sandbox.emit("sulu.header.set-title",a),this.sandbox.emit("sulu.header.set-breadcrumb",b)},render:function(){var a=this.contact?this.contact.firstName+" "+this.contact.lastName:this.sandbox.translate("security.permission.title");this.sandbox.dom.html(this.$el,this.renderTemplate("/admin/security/template/permission/form",{user:this.user?this.user:null,headline:a})),this.sandbox.start(this.$el),this.startLanguageDropdown(),d.call(this)},startLanguageDropdown:function(){var b,c=a.getLocales(!0),d=[];for(b in c)c.hasOwnProperty(b)&&d.push({id:b,name:c[b]});this.systemLanguage=this.user.locale,this.sandbox.start([{name:"select@husky",options:{el:this.sandbox.dom.find("#systemLanguage",this.$el),instanceName:"systemLanguage",defaultLabel:this.sandbox.translate("security.permission.role.chooseLanguage"),value:"name",data:d,preSelectedElements:[this.systemLanguage]}}])},bindRoleTableEvents:function(){this.sandbox.dom.on("#rolesTable","click",function(a){var b=this.sandbox.dom.attr(a.currentTarget,"id");"selectAll"===b?this.selectAll(a.currentTarget):this.selectItem(a.currentTarget)}.bind(this),'input[type="checkbox"]')},selectAll:function(a){var b,c=this.sandbox.dom.find('tr td:first-child() input[type="checkbox"]',"#rolesTable");this.selectedRoles.length===this.roles.length?(this.sandbox.dom.removeClass(a,"is-selected"),this.sandbox.dom.prop(a,"checked",!1),this.sandbox.util.each(c,function(a,b){this.sandbox.dom.removeClass(b,"is-selected"),this.sandbox.dom.prop(b,"checked",!1)}.bind(this)),this.selectedRoles=[],this.sandbox.logger.log(this.selectedRoles,"selected roles")):(this.sandbox.dom.addClass(a,"is-selected"),this.sandbox.dom.prop(a,"checked",!0),this.sandbox.util.each(c,function(a,c){b=this.sandbox.dom.data(this.sandbox.dom.parent(this.sandbox.dom.parent(this.sandbox.dom.parent(c))),"id"),this.selectedRoles.indexOf(b)<0&&this.selectedRoles.push(b),this.sandbox.dom.addClass(c,"is-selected"),this.sandbox.dom.prop(c,"checked",!0)}.bind(this)),this.sandbox.logger.log(this.selectedRoles,"selected roles"))},selectItem:function(a){var b=this.sandbox.dom.data(this.sandbox.dom.parent(this.sandbox.dom.parent(this.sandbox.dom.parent(a))),"id"),c=this.selectedRoles.indexOf(b);c>=0?(this.sandbox.dom.removeClass(a,"is-selected"),this.sandbox.dom.prop(a,"checked",!1),this.selectedRoles.splice(c,1),this.deselectedRoles.indexOf(b)<0&&this.deselectedRoles.push(b),this.sandbox.logger.log(b,"role deselected")):(this.sandbox.dom.addClass(a,"is-selected"),this.sandbox.dom.prop(a,"checked",!0),this.selectedRoles.push(b),this.sandbox.logger.log(b,"role selected"))},bindCustomEvents:function(){this.sandbox.on("sulu.user.permissions.error",function(a){switch(a){case 1001:var b=this.sandbox.dom.parent(this.sandbox.dom.find("#username"));this.sandbox.dom.prependClass(b,"husky-validate-error");break;case 1002:var c=this.sandbox.dom.parent(this.sandbox.dom.find("#passwordRepeat")),d=this.sandbox.dom.parent(this.sandbox.dom.find("#password"));this.sandbox.dom.prependClass(d,"husky-validate-error"),this.sandbox.dom.prependClass(c,"husky-validate-error");break;default:this.sandbox.logger.warn("Unrecognized error code!",a)}this.setHeaderBar(!0)}.bind(this)),this.sandbox.on("sulu.header.toolbar.delete",function(){this.sandbox.emit("sulu.user.permissions.delete",this.contact.id)},this),this.sandbox.on("sulu.user.permissions.saved",function(a){this.user=a,this.sandbox.emit("sulu.labels.success.show","labels.success.permission-save-desc","labels.success"),this.setHeaderBar(!0)},this),this.sandbox.on("sulu.header.toolbar.save",function(){this.save()},this),this.sandbox.on("sulu.header.back",function(){this.sandbox.emit("sulu.contacts.contacts.list")},this),this.sandbox.on("husky.select.systemLanguage.selected.item",function(a){this.systemLanguage=a}.bind(this))},save:function(){var a;this.sandbox.form.validate(this.formId)&&(this.sandbox.logger.log("validation succeeded"),a={user:{username:this.sandbox.dom.val("#username"),email:this.sandbox.dom.val("#email"),contact:this.contact,locale:this.systemLanguage},selectedRolesAndConfig:this.getSelectedRolesAndLanguages(),deselectedRoles:this.deselectedRoles},this.password=this.sandbox.dom.val("#password"),this.user&&this.user.id&&(a.user.id=this.user.id),this.password&&""!==this.password&&(a.user.password=this.password),this.sandbox.emit("sulu.user.permissions.save",a))},getSelectedRolesAndLanguages:function(){var a,b,c=[];return this.sandbox.util.each(this.selectedRoles,function(d,e){a=this.sandbox.dom.find("#languageSelector"+e),b={},b.roleId=e,this.sandbox.emit("husky.select.languageSelector"+e+".get-checked",function(a){b.selection=a}),c.push(b)}.bind(this)),c},initializeRoles:function(){var a=this.sandbox.dom.createElement('<div class="'+c.permissionLoaderClass+'"/>');this.sandbox.dom.append(this.$find(c.permissionGridId),a),this.sandbox.start([{name:"loader@husky",options:{el:a,size:"100px",color:"#e4e4e4"}}]),this.sandbox.util.load(c.localizationsUrl,null,"json").then(function(a){return a._embedded.localizations}).then(this.renderRoles.bind(this))},renderRoles:function(a){this.getSelectRolesOfUser();var b=this.sandbox.dom.$(c.permissionGridId),d=this.sandbox.dom.createElement("<table/>",{"class":"table matrix",id:"rolesTable"}),e=this.prepareTableHeader(),f=this.prepareTableContent(),g=this.sandbox.dom.append(d,e);g=this.sandbox.dom.append(g,f),this.sandbox.dom.html(b,g);var h=this.sandbox.dom.find("tbody tr","#rolesTable");this.sandbox.util.each(h,function(b,d){var e=this.sandbox.dom.data(d,"id"),f=this.getUserRoleLocalesWithRoleId(e);this.sandbox.start([{name:"select@husky",options:{el:"#languageSelector"+e,instanceName:"languageSelector"+e,multipleSelect:!0,defaultLabel:this.sandbox.translate("security.permission.role.chooseLanguage"),checkedAllLabel:this.sandbox.translate("security.permission.role.allLanguages"),value:"name",data:a.map(function(a){return{id:a.localization,name:a.localization}}),preSelectedElements:f}}]),this.sandbox.stop(this.$find(c.permissionLoaderClass))}.bind(this)),this.bindRoleTableEvents()},getUserRoleLocalesWithRoleId:function(a){var b;return this.user&&this.user.userRoles&&this.sandbox.util.each(this.user.userRoles,function(c,d){return d.role.id===a?(b=d.locales,!1):void 0}.bind(this)),b?b:[]},getSelectRolesOfUser:function(){this.user&&this.user.userRoles&&this.sandbox.util.each(this.user.userRoles,function(a,b){this.selectedRoles.push(b.role.id)}.bind(this))},prepareTableHeader:function(){return this.template.tableHead(this.sandbox.translate("security.permission.role.title"),this.sandbox.translate("security.permission.role.language"),this.sandbox.translate("security.permission.role.permissions"))},prepareTableContent:function(){var a=this.sandbox.dom.createElement("<tbody/>"),b=[];return this.sandbox.util.each(this.roles,function(a,c){b.push(this.prepareTableRow(c))}.bind(this)),this.sandbox.dom.append(a,b)},prepareTableRow:function(a){var b;return b=this.selectedRoles.indexOf(a.id)>=0?this.template.tableRow(a.id,a.name,!0):this.template.tableRow(a.id,a.name,!1)},template:{tableHead:function(a,b,c){return["<thead>","   <tr>",'       <th class="checkbox-cell">','           <div class="custom-checkbox">','               <input id="selectAll" type="checkbox"/>','               <span class="icon"></span>',"           </div>","       </th>",'       <th width="30%">',a,"</th>",'       <th width="45%">',b,"</th>",'       <th width="20%">',c,"</th>","   </tr>","</thead>"].join("")},tableRow:function(a,b,c){var d;return d=c?['<tr data-id="',a,'">','   <td class="checkbox-cell">','       <div class="custom-checkbox">','           <input type="checkbox" class="is-selected" checked/>','           <span class="icon"></span>',"       </div>","   </td>","   <td>",b,"</td>",'   <td class="m-top-15" id="languageSelector',a,'"></td>',"   <td></td>","</tr>"].join(""):['<tr data-id="',a,'">','   <td class="checkbox-cell">','       <div class="custom-checkbox">','           <input type="checkbox"/>','           <span class="icon"></span>',"       </div>","   </td>","   <td>",b,"</td>",'   <td class="m-top-15" id="languageSelector',a,'"></td>',"   <td></td>","</tr>"].join("")}}}});