const Input = (props: {
  id: string
  label: String
  type: string
  placeholder?: string
  required?: boolean
}) => {
  return (
    <div className="form-group">
      <label htmlFor={props.id}>{props.label}</label>
      <input
        required={props.required}
        type={props.type}
        name={props.id}
        id={props.id}
        placeholder={props.placeholder}
        className="form-control"
      />
    </div>
  )
}

export default Input
