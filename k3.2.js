$(function () {
	//加载数据表格
	 $("#box").datagrid({
		 data:$utils.data(),
		 iconCls: 'icon-save', //icon-search图标
		 pagination: false, //显示分页
		 pageSize: 15, //页大小
		 pageList: [15, 30, 45, 60], //页大小下拉选项此项各value是pageSize的倍数
		 fit: true, //datagrid自适应宽度
		 fitColumn: false, //列自适应宽度
		 striped: true, //行背景交换
		 nowap: true, //列内容多时自动折至第二行
		 idField: 'ID', //主键
		 columns : $utils.columns,
		 toolbar: "#tb",
// 		 onDblClickRow : function (rowIndex, rowData) {
// 			location.reload();
//			$utils.onDblClickRow(rowIndex, rowData);
// 		 },
		 onAfterEdit : function (rowIndex, rowData, changes) {
//			$utils.onAfterEdit(rowIndex, rowData, changes);
		 },
		 onRowContextMenu : function (e, rowIndex, rowData) {
			e.preventDefault();
			//console.log(rowIndex);
			//console.log(rowData);
			$('#menu').menu('show', {
				left : e.pageX,
				top : e.pageY,
			});
		 },
		 onLoadSuccess: function (data) {
//			if(data.total){
//				$('#box').datagrid("selectRow",0);
//			}
		}
	 });
});

var $utils= {
		editRow : undefined,
		//头部字段配置
		columns:[[{
			field : 'NO',
			title : '次数',
			sortable : true,
			width : 100
//			checkbox : true
		},{
			field : 'ZJJE',
			title : '中奖金额',
			sortable : true,
			width : 100
		},{
			field : 'ZJBS',
			title : '追加倍数',
			sortable : true,
			width : 100
		},{
			field : 'BCCB',
			title : '本次成本',
			sortable : true,
			width : 100
		},{
			field : 'ZCB',
			title : '总成本',
			sortable : true,
			width : 100
		},{
			field : 'ZSY',
			title : '本次收益',
			sortable : true,
			width : 100
		},{
			field : 'BCSY',
			title : '纯收益',
			sortable : true,
			width : 100
		}]],
		toolbar:[{ text: '添加', iconCls: 'icon-add', handler: this.add}, '-',
		         { text: '删除', iconCls: 'icon-remove', handler: this.remove}, '-',
		         { text: '修改', iconCls: 'icon-edit', handler: this.editRow}, '-',
		         { text: '保存', iconCls: 'icon-save', handler: this.save}, '-',
		         { text: '取消编辑', iconCls: 'icon-redo', handler: this.redo}, '-'
		],
		data:function (){
      var num=parseInt($("#zjcs").val());//prompt("追加次数","5");//次数
      var zjje=parseInt($("#zjje").val());//prompt("中奖金额","10");//中奖金额
      var zssy=parseInt($("#zssy").val());//prompt("最少收益","10");//最少收益
      num=num?num:10;
      zjje=zjje?zjje:10;
      zssy=zssy?zssy:10;
      var data=[];
      for(var i=0;i<num;i++){
        var scData=i>0?data[i-1]:{};//上次数据
        var bccb=0;
        var zcb=0;//总成本=上次总成本+本次总成本
        var zsy=0;//总收益=本次成本*中奖倍数
        var bcsy=0;//本次收益=总收益-总成本
        var zjbs=(scData.ZJBS?scData.zjbs:1)*2;//倍数
        bccb+=2*zjbs;
        zcb=(scData.ZCB?scData.ZCB:0)+bccb;//总成本=上次总成本+本次总成本
        zsy=zjbs*zjje;//本次收益=本次成本*中奖倍数
        bcsy=zsy-zcb;//纯收益=本次收益-总成本
        data[i]={
          "NO":i+1,
          "ZJJE":zjje,//中奖金额
          "ZJBS":zjbs,//追加倍数
          "BCCB":bccb,//本次成本
          "ZCB":zcb,//总成本
          "ZSY":zsy,//本次收益
          "BCSY":bcsy//纯收益
        };
      }

      return data;
    },
		//双击行
		onDblClickRow : function (rowIndex, rowData) {
			
			if (this.editRow != undefined) {
				$('#box').datagrid('endEdit', this.editRow);
			}
		
			if (this.editRow == undefined) {
				$('#save,#redo').show();
				$('#box').datagrid('beginEdit', rowIndex);
				this.editRow = rowIndex;
			}
			
		},
		//保存前触发事件
		onAfterEdit : function (rowIndex, rowData, changes) {
			$('#save,#redo').hide();
			
			var inserted = $('#box').datagrid('getChanges', 'inserted');
			var updated = $('#box').datagrid('getChanges', 'updated');
			
			var info =  '';
			//新增用户
			if (inserted.length > 0) {
				url = 'moduleServlet?optionType=insertedModule';
				info = '新增';
			}
			
			//修改用户
			if (updated.length > 0) {
				url = 'moduleServlet?optionType=updatedModule';
				info = '修改';
			}
			
			$.ajax({
				type : 'POST',
				url : url,
				data : {
					row : JSON.stringify(rowData),
				},
				dataType:"json",
				beforeSend : function () {
					$('#box').datagrid('loading');
				},
				success : function (data) {
					if (data) {
						$.messager.show({
							title : '提示',
							msg : data + '个用户被' + info + '成功！',
						});
					}else{
						$.messager.alert('错误', info+'失败！', 'error');
					}
					$('#box').datagrid('loaded');
					$('#box').datagrid('load');
					$('#box').datagrid('unselectAll');
					this.editRow = undefined;
				}
			});
			//console.log(rowData);
		},
		//查询
		search : function () {
			$('#box').datagrid('load', {
				name : $.trim($('input[name="name"]').val()),
				date_from : $('input[name="date_from"]').val(),
				date_to : $('input[name="date_to"]').val(),
			});
		},
		//添加
		add : function () {
			$('#save,#redo').show();
			
			if (this.editRow == undefined) {
				//添加一行 
				$('#box').datagrid('insertRow', {
					index : 0,
					row : {}
				});
				
				//将第一行设置为可编辑状态
				$('#box').datagrid('beginEdit', 0);
				
				this.editRow = 0;
			}
		},
		//保存
		save : function () {
			//将第一行设置为结束编辑状态
			$('#box').datagrid('endEdit', this.editRow);
		},
		//取消编辑
		redo : function () {
			$('#save,#redo').hide();
			this.editRow = undefined;
			$('#box').datagrid('rejectChanges');
		},
		//编辑
		edit : function () {
			var rows = $('#box').datagrid('getSelections');
			if (rows.length == 1) {
				if (this.editRow != undefined) {
					$('#box').datagrid('endEdit', this.editRow);
				}
			
				if (this.editRow == undefined) {
					var index = $('#box').datagrid('getRowIndex', rows[0]);
					$('#save,#redo').show();
					$('#box').datagrid('beginEdit', index);
					this.editRow = index;
					$('#box').datagrid('unselectRow', index);
				}
			} else {
				$.messager.alert('警告', '修改必须或只能选择一行！', 'warning');
			}
		},
		//删除
		remove : function () {
			var rows = $('#box').datagrid('getSelections');
			if (rows.length > 0) {
				$.messager.confirm('确定操作', '您正在要删除所选的记录吗？', function (flag) {
					if (flag) {
						var ids = [];
						for (var i = 0; i < rows.length; i ++) {
							ids.push(rows[i].ID);
						}
						//console.log(ids.join(','));
//						alert(ids.join(','));
						$.ajax({
							type : 'POST',
							url : 'moduleServlet?optionType=deleteModule',
							data : {
								ids : "('"+ids.join("','")+"')",
							},
							dataType:"json",
							beforeSend : function () {
								$('#box').datagrid('loading');
							},
							success : function (data) {
								if (data) {
									$.messager.show({
										title : '提示',
										msg : data + '个用户被删除成功！',
									});
								}else{
									$.messager.alert('错误', '删除失败！', 'error');
								}
								$('#box').datagrid('loaded');
								$('#box').datagrid('load');
								$('#box').datagrid('unselectAll');
							}
						});
					}
				});
			} else {
				$.messager.alert('提示', '请选择要删除的记录！', 'info');
			}
		},
		//详细
		detail : function () {
			var rows = $('#box').datagrid('getSelections');
			if($("#tableDetail")[0]){
				$("#tableDetail").attr("src","module_table.jsp?ID="+formatStr(rows[0].ID));
//				 window.tableDetail.location.href="module_table.jsp?ID="+formatStr(rows[0].ID);
			}else{
				$("body").append("<iframe id='tableDetail' name='tableDetail' src='module_table.jsp?ID="+formatStr(rows[0].ID)+"' style='width:900px;height:300px;'></iframe>");
				var height=parseInt($('#box').datagrid("getPanel")[0].style.height);
				if (rows.length == 1) {
					$("#tableDetail").window({
						title:"模块表信息",
						left:224,
						top:height+40,
						width:916,
						height:300,
						onClose:function(){
							$("#tableDetail").window("destroy");
						}
					});
				} else {
					$.messager.alert('警告', '修改必须或只能选择一行！', 'warning');
				}
			}
		},
	};
