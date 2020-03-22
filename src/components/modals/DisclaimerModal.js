module.exports = {
  template: `
    <ModalConfirmation
      container-classes="max-w-md"
      title="Disclaimer"
      note="The information presented by this plugin is based on the data available on https://arkdelegates.live and has been prepared for informational purposes only."
      cancel-button="Cancel"
      continue-button="I understand"
      @cancel="emitCancel"
      @close="emitCancel"
      @continue="emitConfirm"
    />
  `,

  props: {
    callback: {
      type: Function,
      required: true
    }
  },

  methods: {
    executeCallback (event) {
      this.callback({
        component: 'DisclaimerModal',
        event
      })
    },

    emitCancel () {
      this.executeCallback('cancel')
    },

    emitConfirm () {
      this.executeCallback('confirm')
    }
  }
}
