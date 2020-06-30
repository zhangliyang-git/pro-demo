<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 顶部提示区 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
      </el-alert>
      <!-- 进度条 -->
      <el-steps :space="250" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 主体表单 -->
      <el-form :model="addForm" :rules="addFormrules" ref="addFormRef" label-width="100px" label-position="top">
        <!-- 左侧tab导航栏 -->
        <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <!-- 基本信息面板 -->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight" type="number">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number" type="number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="catelist" :props="cataProps" @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 商品参数面板 -->
            <el-form-item v-for="item in manyTabData" :label="item.attr_name" :key="item.attr_id">
              <!-- 参数的复选框 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="item.attr_vals[i]" v-for="(item1,i) in item.attr_vals" :key="i" border>
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTabData" :label="item.attr_name" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action:图片的后台地址 -->
            <el-upload :action="uploadUrl" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture"
              :headers="headerObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce">
            </quill-editor>
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览区 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%" :before-close="previewHandleClose">
      <img :src="this.previewPath" alt="" style="width:100%">
    </el-dialog>
  </div>
</template>
<script>
// 导入loadash
import _ from 'lodash'

export default {
  data () {
    return {
      // 进度条的步骤索引
      activeIndex: 0,
      // 添加商品表单的数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品分类数组
        goods_cat: [1, 3, 6],
        // 上传的图片数组
        pics: [],
        // 商品详情内容
        goods_introduce: '',
        // 参数和属性数组
        attrs: []
      },
      // 表单验证规则
      addFormrules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类列表,级联选择器的选项对象的数组
      catelist: [],
      // 级联选择器的属性对象
      cataProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 动态参数列表数据
      manyTabData: [],
      // 静态属性列表数据
      onlyTabData: [],
      // 图片上传地址
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 为图片上传组件设置请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片的地址
      previewPath: '',
      previewVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类失败')
      }
      // console.log(res.data)
      this.catelist = res.data
    },
    // 选择商品分类时触发
    handleChange () {
      // 只能选择三级商品分类
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 基本信息标签页在切换之前的判断
    beforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    // 点击商品参数标签页时触发
    async tabClicked () {
      // 确定访问的是商品参数页
      if (this.activeIndex === '1') {
        // 获取参数
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          this.$message.error('获取商品动态参数失败')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        console.log(res.data)
        this.manyTabData = res.data
      } else if (this.activeIndex === '2') {
        // 获取参数
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) {
          this.$message.error('获取商品静态属性失败')
        }
        console.log(res.data)
        this.onlyTabData = res.data
      }
    },
    // 图片预览
    handlePreview (file) {
      console.log(file)
      // 获取图片的url地址
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 预览图片的关闭
    previewHandleClose () {
      this.previewVisible = false
    },
    // 图片删除
    handleRemove (file) {
      // console.log(file)
      // 获取图片的路径
      const filePath = file.response.data.tmp_path
      // 从保存的图片信息数组中找到该图片的索引
      const i = this.addForm.pics.findIndex(x =>
        x.pic === filePath
      )
      // 从图片信息数组中删除
      this.addForm.pics.splice(i, 1)
    },
    // 监听图片上传成功
    handleSuccess (response) {
      // 将图片的临时地址保存，格式根据接口文档的要求
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
      console.log('表单信息数组' + this.addForm)
    },
    // 添加商品
    add () {
      // 添加商品前对表单进行预验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          this.$message.error('请填写必要的表单项')
        }
        // 处理goods_cat，将数组变成字符串
        // addForm 深拷贝（lodash)
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数信息
        this.manyTabData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join('')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性信息
        this.onlyTabData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)

        // 发起添加商品请求
        // 商品名称必须唯一
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          this.$message.error('添加失败了')
          console.log(res)
        }
        this.$message.success('添加成功')
        // 跳转到商品列表页面
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 商品分类id
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.btnAdd {
  margin-top: 15px;
}
</style>
