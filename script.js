const App = {
  name: 'App',
  template: `
    <div>
      <h1>Task queue test</h1>
      <p>
        We have a bunch of promises that have a side effect at the end of their
        run. The goal is to be able to leave before all promises have finished
        and forget them all. Ideally we could cancel them, but that doesn't
        seem possible (or at least easy) so this is the next best thing: make
        sure they don't interfere. The real situation would be something like a
        user navigating away from this route, then coming back. We don't want
        tasks from the previous visit to start playing with the UI. We also
        want to have Vue auto-magically count the tasks in a given state.
      </p>
      <div>To use it:</div>
      <ol>
        <li>Press the <em>Start tasks</em> button</li>
        <li>
          Before all items have finished, press the <em>Start tasks</em> button
          again
        </li>
      </ol>
      <div>We expect that all unfinished old tasks no longer touch the UI.</div>
      <p>Finished tasks count = {{finishedTasks}}</p>
      <p><button @click="startTasks">Start tasks</button></p>
      <ul>
        <li v-for="curr of msgs" :key="curr">{{curr}}</li>
      </ul>
      <h1>Single task test</h1>
      <p>This is a single version of the tasks we use above. To use this test:</p>
      <ol>
        <li>Press the <em>Create task</em> button</li>
        <li>Keep pressing the <em>Check task</em> button for 5 seconds</li>
      </ol>
      <div>
        You will see the current status of the Promise and it will change at 3
        seconds.
      </div>
      <p><button @click="createSingleTask">Create task</button></p>
      <p><button @click="checkSingleTask">Check task</button></p>
      <ul>
        <li v-for="curr of singleTaskMsgs" :key="curr">{{curr}}</li>
      </ul>
    </div>
  `,
  data() {
    return {
      tasks: [],
      msgs: [],
      singleTaskMsgs: [],
      pageLoadTime: Date.now(),
    }
  },
  computed: {
    finishedTasks() {
      return this.tasks.filter(e => e.isDone).length
    },
  },
  methods: {
    startTasks() {
      this.tasks = []
      const msgs = [] // create a specific object for this run, so we can throw it away
      this.msgs = msgs
      for (const curr of '654321') {
        this.tasks.push(
          this.makeCheckablePromise(
            parseInt(curr),
            () => msgs.push(this.timestampMsg(`${curr} is starting`)),
            () => msgs.push(this.timestampMsg(`${curr} is done`)),
          ),
        )
      }
    },
    createSingleTask() {
      this.singleTaskMsgs = ['single task created']
      this.singleTask = this.makeCheckablePromise(
        3,
        () =>
          this.singleTaskMsgs.push(this.timestampMsg('single task started')),
        () => this.singleTaskMsgs.push(this.timestampMsg('single task done')),
      )
    },
    checkSingleTask() {
      const result = this.singleTask.isDone
      this.singleTaskMsgs.push(this.timestampMsg(`result=${result}`))
    },
    makeCheckablePromise(taskTimeSeconds, startCb, doneCb) {
      const result = { isDone: false } // wrap in an object so we deal with references
      ;(async () => {
        startCb()
        await new Promise(resolve => {
          setTimeout(() => {
            return resolve()
          }, taskTimeSeconds * 1000)
        })
        result.isDone = true
        doneCb()
      })()
      return result
    },
    timestampMsg(msg) {
      const timestamp = Date.now() - this.pageLoadTime
      return `[${timestamp}] ${msg}`
    },
  },
}

new Vue({
  render: h => h(App),
}).$mount(`#app`)
