import style from "./style.module.css";

const Loader = () => {
	return (
		<div className={style.overlay}>
			<span className={style.loader}></span>
		</div>
	);
};

export default Loader;
