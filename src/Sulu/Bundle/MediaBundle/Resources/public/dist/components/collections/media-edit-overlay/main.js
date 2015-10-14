define(["services/sulumedia/media-manager"],function(a){"use strict";var b="sulu.media-edit.",c={instanceName:"",locale:Husky.sulu.user.locale},d={infoFormSelector:"#media-info",multipleEditFormSelector:"#media-multiple-edit",dropzoneSelector:"#file-version-change",multipleEditDescSelector:".media-description",multipleEditTagsSelector:".media-tags",descriptionCheckboxSelector:"#show-descriptions",tagsCheckboxSelector:"#show-tags",singleEditClass:"single-edit",multiEditClass:"multi-edit",loadingClass:"loading",loaderClass:"media-edit-loader"},e=function(){return g.call(this,"closed")},f=function(){return g.call(this,"initialized")},g=function(a){return b+(this.options.instanceName?this.options.instanceName+".":"")+a};return{templates:["/admin/media/template/media/info","/admin/media/template/media/versions","/admin/media/template/media/multiple-edit"],initialize:function(){if(this.options=this.sandbox.util.extend(!0,{},c,this.options),!this.options.mediaIds)throw new Error("media-ids are not defined");this.media=null,this.medias=null,this.$multiple=null,this.startLoadingOverlay(),this.loadMedias(this.options.mediaIds,this.options.locale).then(function(a){this.editMedia(a)}.bind(this)),this.sandbox.emit(f.call(this))},startLoadingOverlay:function(){var a=this.sandbox.dom.createElement('<div class="'+d.loadingClass+'"/>'),b=this.sandbox.dom.createElement('<div class="'+d.loaderClass+'" />');this.sandbox.dom.append(this.$el,a),this.sandbox.once("husky.overlay.media-edit.loading.opened",function(){this.sandbox.start([{name:"loader@husky",options:{el:b,size:"100px",color:"#cccccc"}}])}.bind(this)),this.sandbox.start([{name:"overlay@husky",options:{el:a,title:this.sandbox.translate("sulu.media.edit.loading"),data:b,skin:"wide",openOnStart:!0,removeOnClose:!0,instanceName:"media-edit.loading",closeIcon:"",okInactive:!0,propagateEvents:!1}}])},loadMedias:function(b,c){var d=[],e=$.Deferred(),f=[];return b.forEach(function(b){var e=a.loadOrNew(b,c);d.push(e),e.then(function(a){f.push(a)}.bind(this))}.bind(this)),$.when.apply(null,d).then(function(){e.resolve(f)}.bind(this)),e},editMedia:function(a){1===a.length?this.editSingleMedia(a[0]):a.length>1&&this.editMultipleMedia(a)},editSingleMedia:function(a){this.media=a;var b=this.sandbox.dom.createElement(this.renderTemplate("/admin/media/template/media/info",{media:this.media})),c=this.sandbox.dom.createElement(this.renderTemplate("/admin/media/template/media/versions",{media:this.media}));this.startSingleOverlay(b,c)},startSingleOverlay:function(a,b){var c=this.sandbox.dom.createElement('<div class="'+d.singleEditClass+'"/>');this.sandbox.dom.append(this.$el,c),this.bindSingleOverlayEvents(),this.sandbox.start([{name:"overlay@husky",options:{el:c,title:this.media.title,tabs:[{title:this.sandbox.translate("public.info"),data:a},{title:this.sandbox.translate("sulu.media.history"),data:b}],languageChanger:{locales:this.sandbox.sulu.locales,preSelected:this.options.locale},skin:"wide",openOnStart:!0,removeOnClose:!0,instanceName:"media-edit",propagateEvents:!1,okCallback:this.singleOkCallback.bind(this),cancelCallback:function(){this.sandbox.stop()}.bind(this)}}])},singleOkCallback:function(){return this.sandbox.form.validate(d.infoFormSelector)?(this.saveSingleMedia(),void this.sandbox.stop()):!1},bindSingleOverlayEvents:function(){this.sandbox.once("husky.overlay.media-edit.opened",function(){this.sandbox.form.create(d.infoFormSelector).initialized.then(function(){this.sandbox.form.setData(d.infoFormSelector,this.media).then(function(){this.sandbox.start(d.infoFormSelector),this.startSingleDropzone()}.bind(this))}.bind(this))}.bind(this)),this.sandbox.once("husky.overlay.media-edit.initialized",function(){this.sandbox.emit("husky.overlay.media-edit.loading.close")}.bind(this)),this.sandbox.once("husky.overlay.media-edit.language-changed",this.languageChangedSingle.bind(this))},languageChangedSingle:function(a){this.saveSingleMedia().then(function(){this.sandbox.stop(this.$find("*")),this.options.locale=a,this.initialize()}.bind(this))},newVersionUploadedHandler:function(a){a[0]&&(this.sandbox.emit("sulu.medias.media.saved",a[0].id,a[0]),this.sandbox.emit("sulu.labels.success.show","labels.success.media-save-desc"),this.sandbox.stop(this.$find("*")),this.initialize())},saveSingleMedia:function(){var b=$.Deferred();if(this.sandbox.form.validate(d.infoFormSelector)){var c=this.sandbox.form.getData(d.infoFormSelector),e=this.sandbox.util.extend(!1,{},this.media,c);JSON.stringify(this.media)!==JSON.stringify(e)?a.save(e).then(function(){b.resolve()}):b.resolve()}else b.resolve();return b},startSingleDropzone:function(){this.sandbox.on("husky.dropzone.file-version.files-added",this.newVersionUploadedHandler.bind(this)),this.sandbox.start([{name:"dropzone@husky",options:{el:d.dropzoneSelector,maxFilesize:Config.get("sulu-media").maxFilesize,url:"/admin/api/media/"+this.media.id+"?action=new-version",method:"POST",paramName:"fileVersion",showOverlay:!1,skin:"overlay",titleKey:"",descriptionKey:"sulu.media.upload-new-version",instanceName:"file-version",maxFiles:1}}])},editMultipleMedia:function(a){this.medias=a,this.$multiple=this.sandbox.dom.createElement(this.renderTemplate("/admin/media/template/media/multiple-edit")),this.startMultipleEditOverlay()},startMultipleEditOverlay:function(){var a=this.sandbox.dom.createElement('<div class="'+d.multiEditClass+'"/>');this.sandbox.dom.append(this.$el,a),this.bindMultipleOverlayEvents(),this.sandbox.start([{name:"overlay@husky",options:{el:a,title:this.sandbox.translate("sulu.media.multiple-edit.title"),data:this.$multiple,languageChanger:{locales:this.sandbox.sulu.locales,preSelected:this.options.locale},openOnStart:!0,removeOnClose:!0,closeIcon:"",instanceName:"media-multiple-edit",propagateEvents:!1,okCallback:this.multipleOkCallback.bind(this),cancelCallback:function(){this.sandbox.stop()}.bind(this)}}])},multipleOkCallback:function(){return this.sandbox.form.validate(d.multipleEditFormSelector)?(this.saveMultipleMedia(),void this.sandbox.stop()):!1},languageChangedMultiple:function(a){this.saveMultipleMedia().then(function(){this.sandbox.stop(this.$find("*")),this.options.locale=a,this.initialize()}.bind(this))},bindMultipleOverlayEvents:function(){this.sandbox.once("husky.overlay.media-multiple-edit.opened",function(){this.sandbox.form.create(d.multipleEditFormSelector).initialized.then(function(){this.sandbox.form.setData(d.multipleEditFormSelector,{records:this.medias}).then(function(){this.sandbox.start(d.multipleEditFormSelector)}.bind(this))}.bind(this))}.bind(this)),this.sandbox.once("husky.overlay.media-multiple-edit.initialized",function(){this.sandbox.emit("husky.overlay.media-edit.loading.close")}.bind(this)),this.sandbox.dom.on(this.sandbox.dom.find(d.descriptionCheckboxSelector,this.$multiple),"change",this.toggleDescriptions.bind(this)),this.sandbox.dom.on(this.sandbox.dom.find(d.tagsCheckboxSelector,this.$multiple),"change",this.toggleTags.bind(this)),this.sandbox.on("husky.overlay.media-multiple-edit.language-changed",this.languageChangedMultiple.bind(this))},toggleDescriptions:function(){var a=this.sandbox.dom.is(this.sandbox.dom.find(d.descriptionCheckboxSelector,this.$multiple),":checked"),b=this.sandbox.dom.find(d.multipleEditDescSelector,this.$multiple);a===!0?this.sandbox.dom.removeClass(b,"hidden"):this.sandbox.dom.addClass(b,"hidden")},toggleTags:function(){var a=this.sandbox.dom.is(this.sandbox.dom.find(d.tagsCheckboxSelector,this.$multiple),":checked"),b=this.sandbox.dom.find(d.multipleEditTagsSelector,this.$multiple);a===!0?this.sandbox.dom.removeClass(b,"hidden"):this.sandbox.dom.addClass(b,"hidden")},saveMultipleMedia:function(){var b=$.Deferred();if(this.sandbox.form.validate(d.multipleEditFormSelector)){var c=this.sandbox.form.getData(d.multipleEditFormSelector),e=[];this.sandbox.util.foreach(this.medias,function(b,d){var f=this.sandbox.util.extend(!1,{},b,c.records[d]);JSON.stringify(b)!==JSON.stringify(f)&&e.push(a.save(f))}.bind(this)),$.when.apply(null,e).then(function(){b.resolve()}.bind(this))}else b.resolve();return b},destroy:function(){this.sandbox.emit(e.call(this))}}});