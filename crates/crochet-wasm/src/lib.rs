use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn version() -> String {
    String::from(env!("CARGO_PKG_VERSION"))
}

#[cfg(test)]
mod test {

    use super::*;

    #[test]
    fn returns_package_version() {
        assert_eq!(version(), "0.1.0");
    }
}
