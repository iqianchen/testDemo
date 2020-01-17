<template>
  <div id="journalDetail">
    <van-field label="日志标题" :value="datas.ftitle" :placeholder="actionType == 'add' ? '请输入日志标题':''" @blur="changeTitle" :readonly="actionType == 'detail'"/>
    <van-field label="今日工作" input-class="textareaClass" type="textarea" autosize :placeholder="actionType == 'add' ? '请输入今日工作':''" :value="datas.fcontent" @blur="changeContent" :readonly="actionType == 'detail'" />
    <van-field label="工作难点" input-class="textareaClass" type="textarea" autosize :placeholder="actionType == 'add' ? '请输入工作难点':''" :value="datas.fdifficulty" @blur="changeDifficulty" :readonly="actionType == 'detail'" />
    <van-field label="工作心得" input-class="textareaClass" type="textarea" autosize :placeholder="actionType == 'add' ? '请输入工作心得':''" :value="datas.fexperience" @blur="changeExperience" :readonly="actionType == 'detail'" />
    <van-field label="评论" input-class="textareaClass" v-if="showComment" type="textarea" autosize placeholder="请输入评论" :value="datas.fcomment" @blur="changeComment" />

    <div class="commit" v-if="actionType == 'add'">
      <van-button type="primary" size="large" @click="submit">提交</van-button>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import dateFormula from '@js/dateFormula.js'
import { prevPageSetData } from "@js/pageValue";
export default {
  data() {
    return {
      datas: {
        ftitle: '',
        fcontent: '',
        fdifficulty: '',
        fexperience: '',
        fcomment: '',
        fdate: dateFormula.format(new Date(), 'yyyy-MM-dd')
      },
      actionType: 'add',
      showComment: false
    }
  },
  onLoad(query) {
    if (query) {
      if (query.actionType == 'detail') {
        this.actionType = query.actionType
        this.getDetail(query.id)
      }
      if (query.comment) {
        this.actionType = 'detail'
        this.showComment = true
        this.getDetail(query.id)
      } 
    }
  },
  onUnload() {
    this.initPage()
  },
  methods: {
    initPage() {
      this.datas = {
        ftitle: '',
        fcontent: '',
        fdifficulty: '',
        fexperience: '',
        fcomment: '',
        fdate: dateFormula.format(new Date(), 'yyyy-MM-dd')
      }
      this.showComment = false
      this.actionType = 'add'
    },
    async getDetail(id) {
      let params = {
        PersonalLogId: id
      }
      let result = await this.$http.post('/api/CrmMobile/GetPersonalLogById', params)
      this.datas = result
    },
    submit() {
      setTimeout(()=>{
        this.commit()
      },100)
    },
    // 提交
    async commit() {
      let result = await this.$http.post('/api/CrmMobile/AddPersonalLog', this.datas)
      if (result) {
        wx.showToast({ title: '添加成功', duration: 800})
        setTimeout(()=> {
          prevPageSetData('update', true)
          wx.navigateBack({ delta: 1})
        }, 800)
      }
    },
    changeTitle(e) {
      this.datas.ftitle = e.mp.detail.value
    },
    changeContent(e) {
      this.datas.fcontent = e.mp.detail.value
    },
    changeDifficulty(e) {
      this.datas.fdifficulty = e.mp.detail.value
    },
    changeExperience(e) {
      this.datas.fexperience = e.mp.detail.value
    },
    changeComment(e) {
      this.datas.fcomment = e.mp.detail.value
    }
  }
}
</script>

<style lang="less">
#journalDetail {
  .textareaClass {
    min-height: 60px !important;
  }
  .commit {
    width: 90%;
    margin: 20px auto;
  }
}
</style>